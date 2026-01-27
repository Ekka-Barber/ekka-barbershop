import { BRAND_COLORS } from './payslip-html-constants';

/** Progress bar color mapping based on sales percentage */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 150) return BRAND_COLORS.progressBarDarkest;
  if (percentage >= 120) return BRAND_COLORS.progressBarDarker;
  if (percentage >= 100) return BRAND_COLORS.progressBarDark;
  if (percentage >= 70) return BRAND_COLORS.progressBarMedium;
  return BRAND_COLORS.progressBarLight;
};

/** Format currency with Arabic SAR symbol */
export const formatCurrency = (amount: number): string => {
  return Math.round(amount).toLocaleString('en-US') + ' ر.س';
};

/** Format date in Arabic */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/** Calculate sales percentage (capped at 150%) */
export const calculateSalesPercentage = (sales: number, target?: number): number => {
  if (!target || target === 0) return 0;
  return Math.min((sales / target) * 100, 150);
};
