import { prisma } from './prisma';
import { enqueueJob } from './queue';
import { processWishlistStockAlert } from './wishlist-alerts';

export async function updateProductVariantStock(variantId: string, newStock: number) {
  // Get current stock
  const currentVariant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true },
  });

  const oldStock = currentVariant?.stock ?? 0;

  // Update in DB
  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });

  // If stock went from 0 to > 0, trigger the stock alert job!
  if (oldStock === 0 && newStock > 0) {
    await enqueueJob({
      type: 'WISHLIST_STOCK_ALERT',
      payload: { variantId, stock: newStock },
    });
    // Trigger simulated notification delivery
    await processWishlistStockAlert(variantId, newStock);
  }

  return updatedVariant;
}
