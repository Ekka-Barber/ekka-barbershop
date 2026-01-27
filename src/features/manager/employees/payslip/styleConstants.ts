import { PayslipColors } from '../../types/payslip';

// Brand color palette
export const PAYSLIP_COLORS: PayslipColors = {
  primaryGold: '#e9b353',    // Base golden color
  secondaryGold: '#d4921b',  // Darker gold
  tertiaryGold: '#efc780',   // Lighter gold
  backgroundGray: '#6D6D6D', // For contrast elements
  documentBg: '#FBF7F0',     // Light beige for paper-like effect
  textPrimary: '#222222',    // Black for optimal readability
  textSecondary: '#555555',  // Lighter text for secondary information
  positive: '#2E7D32',       // Forest green for positive values (bonuses)
  negative: '#D32F2F',       // Deep red for negative values (deductions/loans)
  progressBarLight: '#FFFFFF',  // White for progress bar start
  progressBarMedium: '#8BC34A', // Light green for progress bar middle
  progressBarDark: '#2E7D32',   // Dark green for progress bar end
};

// Sales milestones color settings
export const SALES_MILESTONE_COLORS = {
  initial: '#FF8F8F',      // Light red - below first milestone
  milestone1: '#FFCF7D',   // Orange/yellow - first milestone (7,000)
  milestone2: '#A9DD7E',   // Light green - second milestone (10,000)
  milestone3: '#7DD196',   // Medium green - third milestone (12,000)
  milestone4: '#2E7D32',   // Dark green - fourth milestone (15,000)
};

// Sales milestone thresholds
export const SALES_MILESTONES = {
  milestone1: 7000,
  milestone2: 10000,
  milestone3: 12000,
  milestone4: 15000,
};

// Function to get progress bar color based on sales amount
export const getSalesProgressColor = (salesAmount: number): string => {
  if (salesAmount >= SALES_MILESTONES.milestone4) {
    return SALES_MILESTONE_COLORS.milestone4;
  } else if (salesAmount >= SALES_MILESTONES.milestone3) {
    return SALES_MILESTONE_COLORS.milestone3;
  } else if (salesAmount >= SALES_MILESTONES.milestone2) {
    return SALES_MILESTONE_COLORS.milestone2;
  } else if (salesAmount >= SALES_MILESTONES.milestone1) {
    return SALES_MILESTONE_COLORS.milestone1;
  } else {
    return SALES_MILESTONE_COLORS.initial;
  }
};

// Company information
export const COMPANY_INFO = {
  name: 'إكه للعناية بالرجل',
  logoPath: '/logo_Header/header11.png',
  logoAlt: 'Company Logo',
};

// Font information
export const FONT_INFO = {
  family: 'IBM Plex Sans Arabic',
  regularPath: '/fonts/IBMPlexSansArabic-Regular.ttf',
  mediumPath: '/fonts/IBMPlexSansArabic-Regular.ttf',
  boldPath: '/fonts/IBMPlexSansArabic-Regular.ttf',
  semiBoldPath: '/fonts/IBMPlexSansArabic-Regular.ttf',
};

// PDF styling constants
export const PDF_STYLES = {
  pageMargin: 30,
  sectionSpacing: 15,
  borderRadius: 4,
  tableBorderColor: '#E0E0E0',
  headerHeight: 80,
  footerHeight: 40,
};

// Golden gradient styling for headers and highlights
export const GOLD_GRADIENT = {
  colors: [PAYSLIP_COLORS.secondaryGold, PAYSLIP_COLORS.primaryGold, PAYSLIP_COLORS.tertiaryGold],
  angle: 45,
};

// Date formatting options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  calendar: 'gregory'
};

// Decimal formatting options for currency
export const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}; 
