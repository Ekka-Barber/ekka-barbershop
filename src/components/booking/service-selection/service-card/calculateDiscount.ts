
export interface DiscountResult {
  percentage: number;
  finalPrice: number;
}

export const calculateDiscount = (
  price: number, 
  discountType?: string, 
  discountValue?: number
): DiscountResult | null => {
  if (!discountType || !discountValue || discountValue <= 0) return null;
  
  if (discountType === 'percentage') {
    // Make sure percentage discount is properly calculated
    const discountedPrice = price * (1 - discountValue/100);
    return {
      percentage: discountValue,
      finalPrice: discountedPrice
    };
  }
  
  // If discount is amount-based, calculate percentage
  if (price > 0) {
    // Prevent division by zero
    const percentage = Math.round((discountValue / price) * 100);
    return {
      percentage,
      finalPrice: price - discountValue
    };
  }
  
  return null;
};
