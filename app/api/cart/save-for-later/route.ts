import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

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

    const { cartItemId, toStatus } = await request.json();

    if (!cartItemId || !toStatus) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    if (toStatus !== 'ACTIVE' && toStatus !== 'SAVED_FOR_LATER') {
      return NextResponse.json({ error: 'Estado de destino no válido' }, { status: 400 });
    }

    // 1. Find the current item and its cart
    const currentItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!currentItem) {
      return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    }

    // Verify ownership
    const cart = currentItem.cart;
    if (cart.userId && cart.userId !== userId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    if (!cart.userId && cart.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // 2. Find or create target cart
    let targetCart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: toStatus }
        : { sessionId, status: toStatus },
    });

    if (!targetCart) {
      targetCart = await prisma.cart.create({
        data: userId
          ? { userId, status: toStatus }
          : { sessionId, status: toStatus },
      });
    }

    // 3. Move/Merge item in target cart
    const existingTargetItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: targetCart.id,
          productVariantId: currentItem.productVariantId,
        },
      },
    });

    if (existingTargetItem) {
      await prisma.cartItem.update({
        where: { id: existingTargetItem.id },
        data: {
          quantity: existingTargetItem.quantity + currentItem.quantity,
          priceSnapshot: currentItem.priceSnapshot,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: targetCart.id,
          productVariantId: currentItem.productVariantId,
          quantity: currentItem.quantity,
          priceSnapshot: currentItem.priceSnapshot,
        },
      });
    }

    // 4. Delete item from original cart
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error moving cart item:', error);
    return NextResponse.json({ error: 'Error al mover artículo' }, { status: 500 });
  }
}
