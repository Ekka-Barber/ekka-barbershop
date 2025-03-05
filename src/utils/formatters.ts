
import { convertToArabic } from "./arabicNumerals";
import { formatNumber } from "./priceFormatting";

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  if (typeof duration !== 'number' || isNaN(duration)) {
    console.warn('Invalid duration value:', duration);
    duration = 0; // Fallback to zero if invalid
  }
  
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules with abbreviation د instead of دقيقة
    return `${formattedNumber} د`;
  }
  
  return `${formattedNumber} mins`;
};
