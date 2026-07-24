import { prisma } from '@/lib/prisma';

export async function getRecommendedProducts(productId: string, categoryId: string, limit = 4) {
  try {
    // 1. Buscar productos frecuentemente comprados juntos
    const orderItemsWithCurrentProduct = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 10,
    });

    const orderIds = orderItemsWithCurrentProduct.map((oi) => oi.orderId);

    let coBoughtProductIds: string[] = [];
    if (orderIds.length > 0) {
      const coBoughtItems = await prisma.orderItem.findMany({
        where: {
          orderId: { in: orderIds },
          productId: { not: productId },
        },
        select: { productId: true },
        take: limit,
      });
      coBoughtProductIds = coBoughtItems.map((item) => item.productId);
    }

    // 2. Combinar con productos de la misma categoría
    const recommended = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: coBoughtProductIds } },
          { categoryId: categoryId, id: { not: productId } },
        ],
      },
      take: limit,
      include: { category: true },
    });

    return recommended;
  } catch (error) {
    console.error('Error al generar recomendaciones:', error);
    return [];
  }
}
