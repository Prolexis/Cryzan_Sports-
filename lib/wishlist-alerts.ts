import { prisma } from './prisma';

export async function processWishlistStockAlert(variantId: string, newStock: number) {
  if (newStock <= 0) return { success: true, count: 0 };

  const wishlistItems = await prisma.wishlist.findMany({
    where: { variantId },
    include: {
      user: true,
      product: true,
      variant: true,
    },
  });

  for (const item of wishlistItems) {
    const variantDesc = item.variant ? `(Talla ${item.variant.size})` : '';
    console.log(
      `🔔 [WEBPUSH WISHLIST STOCK ALERT] Enviado a: ${item.user.email} - El producto "${item.product.name} ${variantDesc}" vuelve a estar disponible. Stock actual: ${newStock} unidades.`
    );
  }

  return { success: true, count: wishlistItems.length };
}

export async function processWishlistPriceAlert() {
  const wishlistItems = await prisma.wishlist.findMany({
    include: {
      user: true,
      product: true,
      variant: true,
    },
  });

  let alertsSentCount = 0;

  for (const item of wishlistItems) {
    const currentPrice = item.product.price;
    if (currentPrice < item.priceAtAdd) {
      const variantDesc = item.variant ? ` (Talla ${item.variant.size})` : '';
      console.log(
        `🔔 [WEBPUSH WISHLIST PRICE ALERT] Enviado a: ${item.user.email} - ¡Alerta de Descuento! "${item.product.name}${variantDesc}" bajó de precio de S/. ${item.priceAtAdd.toFixed(2)} a S/. ${currentPrice.toFixed(2)}.`
      );

      // Update snapshot to prevent duplicate alerts
      await prisma.wishlist.update({
        where: { id: item.id },
        data: { priceAtAdd: currentPrice },
      });

      alertsSentCount++;
    }
  }

  return { success: true, count: alertsSentCount };
}
