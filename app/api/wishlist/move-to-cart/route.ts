import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { wishlistId } = await request.json();

    if (!wishlistId) {
      return NextResponse.json({ error: 'El ID de favorito es requerido' }, { status: 400 });
    }

    // 1. Fetch wishlist item and details
    const wishItem = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: { product: true },
    });

    if (!wishItem) {
      return NextResponse.json({ error: 'Artículo de favoritos no encontrado' }, { status: 404 });
    }

    // Verify ownership
    if (wishItem.userId !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // 2. Resolve variant ID
    let targetVariantId = wishItem.variantId;
    if (!targetVariantId) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { productId: wishItem.productId },
      });
      if (!firstVariant) {
        return NextResponse.json({ error: 'Variante de producto no encontrada para añadir al carrito' }, { status: 404 });
      }
      targetVariantId = firstVariant.id;
    }

    // Check variant stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: targetVariantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variante no encontrada en inventario' }, { status: 404 });
    }

    if (variant.stock < 1) {
      return NextResponse.json({ error: 'El producto está agotado' }, { status: 400 });
    }

    // 3. Find or create user active cart
    let activeCart = await prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!activeCart) {
      activeCart = await prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
      });
    }

    // 4. Upsert cart item
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: activeCart.id,
          productVariantId: targetVariantId,
        },
      },
    });

    if (existingCartItem) {
      if (variant.stock < existingCartItem.quantity + 1) {
        return NextResponse.json({ error: 'Stock insuficiente para añadir más unidades' }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + 1,
          priceSnapshot: variant.product.price,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: activeCart.id,
          productVariantId: targetVariantId,
          quantity: 1,
          priceSnapshot: variant.product.price,
        },
      });
    }

    // 5. Delete from wishlist
    await prisma.wishlist.delete({
      where: { id: wishlistId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in move-to-cart API:', error);
    return NextResponse.json({ error: 'Error al mover el producto al carrito' }, { status: 500 });
  }
}
