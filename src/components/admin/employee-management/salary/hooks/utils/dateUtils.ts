
/**
 * Utility functions for date handling in salary calculations
 */

/**
 * Get start and end date for a month in YYYY-MM format
 */
export const getMonthDateRange = (selectedMonth: string) => {
  const startDate = `${selectedMonth}-01`;
  const [year, month] = selectedMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${selectedMonth}-${lastDay.toString().padStart(2, '0')}`;
  
  return { startDate, endDate };
};
