// ==============================================================================
// KAMINI COLLECTIONS - PRICING & CURRENCY UTILITIES
// All database financial amounts are in integer paise (1 INR = 100 paise)
// ==============================================================================

export const FREE_SHIPPING_THRESHOLD_PAISE = 200000; // Free shipping above Rs. 2,000
export const STANDARD_SHIPPING_PAISE = 15000; // Standard shipping Rs. 150

/**
 * Formats integer paise into standard Indian Rupee currency representation.
 * Example: 1250000 -> "₹12,500"
 */
export function formatPrice(paise: number | null | undefined): string {
  if (paise == null || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Converts integer paise to numerical rupees for input forms
 */
export function paiseToRupees(paise: number | null | undefined): number {
  if (paise == null) return 0;
  return Math.round(paise) / 100;
}

/**
 * Converts numerical rupees to integer paise
 */
export function rupeesToPaise(rupees: number | null | undefined): number {
  if (rupees == null || isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Calculates discount percentage
 */
export function calculateDiscountPercentage(
  pricePaise: number,
  compareAtPricePaise: number | null | undefined
): number | null {
  if (!compareAtPricePaise || compareAtPricePaise <= pricePaise) return null;
  const discount = ((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100;
  return Math.round(discount);
}

/**
 * Computes shipping charge based on subtotal
 */
export function calculateShipping(subtotalPaise: number): number {
  if (subtotalPaise <= 0) return 0;
  return subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : STANDARD_SHIPPING_PAISE;
}

/**
 * Computes order totals with safety validation
 */
export function computeOrderTotals(items: { price_paise: number; quantity: number }[], discountPaise = 0) {
  const subtotalPaise = items.reduce((acc, item) => {
    return acc + Math.max(0, item.price_paise) * Math.max(0, item.quantity);
  }, 0);

  const shippingPaise = calculateShipping(subtotalPaise);
  const totalPaise = Math.max(0, subtotalPaise + shippingPaise - discountPaise);

  return {
    subtotalPaise,
    shippingPaise,
    discountPaise,
    totalPaise,
  };
}
