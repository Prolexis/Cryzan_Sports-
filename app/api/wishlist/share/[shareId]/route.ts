import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json({ error: 'Token de compartición no provisto' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { wishlistShareId: shareId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Lista de favoritos no encontrada' }, { status: 404 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
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
    }));

    return NextResponse.json({
      ownerName: user.name,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching shared wishlist:', error);
    return NextResponse.json({ error: 'Error al obtener la lista compartida' }, { status: 500 });
  }
}
