export interface ShippingItem {
  quantity: number;
  product: {
    weightGrams: number;
    volumeCm3: number;
  };
}

/**
 * Calculates the dynamic shipping cost based on weight and volume.
 * Base cost is S/. 10.00.
 * Additional weight: S/. 2.00 per kg (1000g) above 1kg.
 * Additional volume: S/. 1.50 per 1000 cm3 above 5000 cm3.
 */
export function calculateShippingCost(items: ShippingItem[]): number {
  if (!items || items.length === 0) return 0;

  let totalWeightGrams = 0;
  let totalVolumeCm3 = 0;

  for (const item of items) {
    const weight = item.product?.weightGrams ?? 500;
    const volume = item.product?.volumeCm3 ?? 1000;
    totalWeightGrams += weight * item.quantity;
    totalVolumeCm3 += volume * item.quantity;
  }

  const baseCost = 10.00;

  // Weight surcharge (above 1000g)
  let weightSurcharge = 0;
  if (totalWeightGrams > 1000) {
    const excessWeightKg = (totalWeightGrams - 1000) / 1000;
    weightSurcharge = excessWeightKg * 2.00;
  }

  // Volume surcharge (above 5000 cm3)
  let volumeSurcharge = 0;
  if (totalVolumeCm3 > 5000) {
    const excessVolumeLiters = (totalVolumeCm3 - 5000) / 1000;
    volumeSurcharge = excessVolumeLiters * 1.50;
  }

  const totalCost = baseCost + weightSurcharge + volumeSurcharge;

  // Round to 2 decimal places
  return Math.round(totalCost * 100) / 100;
}
