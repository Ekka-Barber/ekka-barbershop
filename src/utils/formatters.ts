
import { convertToArabic } from "./arabicNumerals";

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules with abbreviation د instead of دقيقة
    return `${formattedNumber} د`;
  }
  
  return `${formattedNumber} mins`;
};

// Format a price with currency symbol according to language
export const formatPrice = (price: number, language: 'en' | 'ar' = 'en'): string => {
  const roundedPrice = Math.round(price);
  
  if (language === 'ar') {
    return `${convertToArabic(roundedPrice.toString())} ريال`;
  }
  
  return `${roundedPrice} SAR`;
};

// Format a price in Arabic
export const formatPriceArabic = (price: number): string => {
  const roundedPrice = Math.round(price);
  return convertToArabic(roundedPrice.toString());
};

// Format a date string to display in the proper language
export const formatDateString = (dateStr: string, language: 'en' | 'ar' = 'en'): string => {
  if (language === 'ar') {
    return convertToArabic(dateStr);
  }
  return dateStr;
};


