/**
 * Check if a value is a negative amount for color coding
 */
export const isNegativeAmount = (amount: number): boolean => {
  return amount < 0;
};

/**
 * Check if a value is a positive amount for color coding
 */
export const isPositiveAmount = (amount: number): boolean => {
  return amount > 0;
};

/**
 * Calculate the total amount from financial items
 * @param items Array of financial items with amount property
 * @returns Total sum of all amounts
 */
export const calculateTotal = <T extends { amount: number }>(items: T[]): number => {
  return items.reduce((total, item) => total + item.amount, 0);
};

/**
 * Determine if a value is positive, negative, or zero
 * @param value Number to evaluate
 * @returns 'positive', 'negative', or 'neutral'
 */
export const getValueType = (value: number): 'positive' | 'negative' | 'neutral' => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};