import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { calculateShippingCost } from '@/lib/shipping';

async function getCartDetails(cart: any) {
  if (!cart) return { id: null, items: [], totalPrice: 0, shippingCost: 0 };

  const formattedItems = cart.items.map((item: any) => {
    const variant = item.productVariant;
    const product = variant.product;
    return {
      id: item.id,
      productVariantId: item.productVariantId,
      productId: product.id,
      name: `${product.name} (Talla ${variant.size})`,
      price: product.price,
      priceSnapshot: item.priceSnapshot,
      image: product.image,
      quantity: item.quantity,
      size: variant.size,
      color: variant.color,
      weightGrams: product.weightGrams,
      volumeCm3: product.volumeCm3,
      stock: variant.stock,
    };
  });

  const totalPrice = formattedItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  const shippingItems = cart.items.map((item: any) => ({
    quantity: item.quantity,
    product: {
      weightGrams: item.productVariant.product.weightGrams,
      volumeCm3: item.productVariant.product.volumeCm3,
    },
  }));
  const shippingCost = calculateShippingCost(shippingItems);

  return {
    id: cart.id,
    items: formattedItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
    shippingCost,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    let userId = session?.user?.id || null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) userId = null;
    }

    if (!userId && !sessionId) {
      return NextResponse.json({ id: null, items: [], totalPrice: 0, shippingCost: 0, savedForLater: [] });
    }

    // 1. Fetch active cart
    const activeCart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: 'ACTIVE' }
        : { sessionId, status: 'ACTIVE' },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    const activeDetails = await getCartDetails(activeCart);

    // 2. Fetch saved for later items
    const savedCart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: 'SAVED_FOR_LATER' }
        : { sessionId, status: 'SAVED_FOR_LATER' },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    const savedDetails = await getCartDetails(savedCart);

    return NextResponse.json({
      ...activeDetails,
      savedForLater: savedDetails.items,
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Error al obtener el carrito' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    let userId = session?.user?.id || null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) userId = null;
    }

    if (!userId && !sessionId) {
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 400 });
    }

    const { productVariantId, productId, quantity = 1 } = await request.json();

    if (!productVariantId && !productId) {
      return NextResponse.json({ error: 'Variant ID or Product ID is required' }, { status: 400 });
    }

    let targetVariantId = productVariantId;

    if (!targetVariantId && productId) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { productId },
      });
      if (!firstVariant) {
        return NextResponse.json({ error: 'No se encontraron variantes para este producto' }, { status: 404 });
      }
      targetVariantId = firstVariant.id;
    }

    // 1. Find product variant and price
    const variant = await prisma.productVariant.findUnique({
      where: { id: targetVariantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variante de producto no encontrada' }, { status: 404 });
    }

    if (variant.stock < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });
    }

    // 2. Find or create active cart
    let activeCart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: 'ACTIVE' }
        : { sessionId, status: 'ACTIVE' },
    });

    if (!activeCart) {
      activeCart = await prisma.cart.create({
        data: userId
          ? { userId, status: 'ACTIVE' }
          : { sessionId, status: 'ACTIVE' },
      });
    }

    // 3. Add or update CartItem
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: activeCart.id,
          productVariantId: targetVariantId,
        },
      },
    });

    if (existingItem) {
      if (variant.stock < existingItem.quantity + quantity) {
        return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          priceSnapshot: variant.product.price,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: activeCart.id,
          productVariantId: targetVariantId, // FIX: Use targetVariantId instead of productVariantId
          quantity,
          priceSnapshot: variant.product.price,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: activeCart.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    const details = await getCartDetails(updatedCart);
    return NextResponse.json(details);
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 });
  }
}
