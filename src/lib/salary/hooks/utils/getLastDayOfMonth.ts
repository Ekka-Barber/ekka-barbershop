
/**
 * Helper function to get the last day of a month in YYYY-MM-DD format
 */
export const getLastDayOfMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
};
