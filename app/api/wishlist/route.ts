import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, wishlistShareId: true },
    });

    if (!userExists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    let shareId = userExists.wishlistShareId;
    if (!shareId) {
      shareId = crypto.randomUUID();
      await prisma.user.update({
        where: { id: userId },
        data: { wishlistShareId: shareId },
      });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            image: true,
            stock: true,
          },
        },
        variant: {
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      priceAtAdd: item.priceAtAdd,
      product: item.product,
      variant: item.variant,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ items, shareId });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Error al obtener la lista de favoritos' }, { status: 500 });
  }
}
