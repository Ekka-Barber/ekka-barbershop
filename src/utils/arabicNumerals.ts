
interface ArabicNumerals {
  [key: string]: string;
}

export const arabicNumerals: ArabicNumerals = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩'
};

export const convertToArabic = (str: string): string => {
  return str.replace(/[0-9]/g, (digit) => arabicNumerals[digit] || digit);
};
