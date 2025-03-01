
import { convertToArabic } from "./arabicNumerals";

export const formatNumber = (num: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(num);
  return language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
};

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules with abbreviation د instead of دقيقة
    return `${formattedNumber} د`;
  }
  
  return `${formattedNumber} mins`;
};

export const formatRiyal = (amount: number): string => {
  return Math.round(amount).toString();
};
