import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

async function verifyCartItemOwnership(cartItemId: string) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  let userId = session?.user?.id || null;
  if (userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) userId = null;
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      productVariant: true,
    },
  });

  if (!cartItem) {
    return { error: 'Artículo del carrito no encontrado', status: 404 };
  }

  // Check ownership
  const cart = cartItem.cart;
  if (cart.userId && cart.userId !== userId) {
    return { error: 'Acceso denegado', status: 403 };
  }
  if (!cart.userId && cart.sessionId !== sessionId) {
    return { error: 'Acceso denegado', status: 403 };
  }

  return { cartItem };
}

export async function PUT(request: Request) {
  try {
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const { cartItem, error, status } = await verifyCartItemOwnership(cartItemId);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    // Verify stock
    if (cartItem!.productVariant.stock < quantity) {
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Error al actualizar artículo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { cartItemId } = await request.json();

    if (!cartItemId) {
      return NextResponse.json({ error: 'Falta ID del artículo' }, { status: 400 });
    }

    const { error, status } = await verifyCartItemOwnership(cartItemId);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Error al eliminar artículo' }, { status: 500 });
  }
}
