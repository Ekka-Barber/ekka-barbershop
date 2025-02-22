
import { convertToArabic } from "./arabicNumerals";

export const formatNumber = (num: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(num);
  return language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
};

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules
    if (rounded === 1) return `${formattedNumber} دقيقة`;
    if (rounded === 2) return `${formattedNumber} دقيقتان`;
    if (rounded >= 3 && rounded <= 10) return `${formattedNumber} دقائق`;
    return `${formattedNumber} دقيقة`;
  }
  
  return `${formattedNumber} mins`;
};

export const formatRiyal = (amount: number): string => {
  return Math.round(amount).toString();
};
