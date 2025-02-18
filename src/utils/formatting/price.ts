
export const formatPrice = (price: number, language: string) => {
  const roundedPrice = Math.floor(price);
  return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
};

export const calculateDiscountedPrice = (
  price: number,
  discountType: string | null,
  discountValue: number | null
) => {
  if (!discountType || !discountValue) return price;
  
  if (discountType === 'percentage') {
    return price - (price * (discountValue / 100));
  }
  return price - discountValue;
};

export const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};
