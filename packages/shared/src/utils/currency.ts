/**
 * Formats a price amount to Saudi Riyal currency format
 */
export const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString('en-SA')} SAR`;
};

/**
 * Format a numeric value as currency in SAR with Arabic numerals
 * @param amount The numeric amount to format
 * @param defaultValue Default value to return if amount is invalid
 * @returns Formatted currency string
 */
export const formatCurrencySAR = (amount: number | null | undefined, defaultValue = '0'): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return defaultValue;
  }

  try {
    // Round to whole numbers
    const roundedAmount = Math.round(Number(amount));

    // Using Intl.NumberFormat for proper currency formatting with English numerals
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return defaultValue;
  }
};
