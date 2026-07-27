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
    // Verify user exists in DB
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { productId, variantId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'El ID del producto es requerido' }, { status: 400 });
    }

    const targetVariantId = variantId || null;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: targetVariantId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ added: false });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }

      await prisma.wishlist.create({
        data: {
          userId,
          productId,
          variantId: targetVariantId,
          priceAtAdd: product.price,
        },
      });
      return NextResponse.json({ added: true });
    }
  } catch (error: any) {
    console.error('Error in wishlist toggle route:', error);
    return NextResponse.json({ error: 'Error al actualizar lista de favoritos' }, { status: 500 });
  }
}
