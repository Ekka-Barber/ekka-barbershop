
export interface DiscountResult {
  percentage: number;
  finalPrice: number;
}

export const calculateDiscount = (
  price: number, 
  discountType?: string, 
  discountValue?: number
): DiscountResult | null => {
  if (!discountType || !discountValue) return null;
  
  if (discountType === 'percentage') {
    return {
      percentage: discountValue,
      finalPrice: price * (1 - discountValue/100)
    };
  }
  
  // If discount is amount-based, calculate percentage
  const percentage = Math.round((discountValue / price) * 100);
  return {
    percentage,
    finalPrice: price - discountValue
  };
};
