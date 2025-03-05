
import { convertToArabic } from "./arabicNumerals";

/**
 * Formats a number according to the specified language
 * @param num The number to format
 * @param language The language to format for ('en' or 'ar')
 * @returns Formatted number string
 */
export const formatNumber = (num: number, language: 'en' | 'ar' = 'en'): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number value:', num);
    num = 0; // Fallback to zero if invalid
  }
  
  const rounded = Math.round(num);
  return language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
};

/**
 * Formats a price in SAR currency
 * @param amount The amount to format
 * @returns Formatted price string
 */
export const formatRiyal = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('Invalid amount value:', amount);
    amount = 0; // Fallback to zero if invalid
  }
  
  return Math.round(amount).toString();
};

/**
 * Rounds a price according to business rules
 * - If decimal is >= 0.5, round up
 * - If decimal is <= 0.4, round down
 */
export const roundPrice = (price: number): number => {
  if (typeof price !== 'number' || isNaN(price)) {
    console.warn('Invalid price value:', price);
    return 0; // Fallback to zero if invalid
  }
  
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};
