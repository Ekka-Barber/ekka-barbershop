/**
 * Utility functions for date operations related to salary calculations
 */

/**
 * Returns the first day of the current month in YYYY-MM-01 format
 */
export const getCurrentMonth = (): string => {
  const currentDate = new Date();
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Validates if a month string is in the correct format and represents a valid date
 * @param month Month string to validate
 * @returns True if month is valid, false otherwise
 */
const isValidMonth = (month: string): boolean => {
  try {
    if (!month || typeof month !== 'string') {
      return false;
    }
    
    const monthRegex = /^\d{4}-\d{2}-01$/;
    if (!monthRegex.test(month)) {
      return false;
    }
    
    const date = new Date(month);
    
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const inputMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    return inputMonth <= currentMonth;
  } catch {
    return false;
  }
};

/**
 * Formats a month string for display in Arabic
 * @param month Month string in YYYY-MM-01 format
 * @returns Formatted month display string in Arabic
 */
export const formatMonthForDisplay = (month: string): string => {
  try {
    if (!isValidMonth(month)) {
      return getCurrentMonth();
    }
    
    const date = new Date(month);
    if (isNaN(date.getTime())) {
      return getCurrentMonth();
    }
    
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  } catch {
    return 'الشهر الحالي';
  }
};

/**
 * Returns an array of month options for the last 12 months
 * @returns Array of month options with value (YYYY-MM-01) and Arabic label
 */
export const getMonthOptions = (): Array<{value: string, label: string}> => {
  try {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (isValidMonth(monthValue)) {
        options.push({
          value: monthValue,
          label: formatMonthForDisplay(monthValue)
        });
      }
    }
    
    return options;
  } catch {
    const currentMonth = getCurrentMonth();
    return [{
      value: currentMonth,
      label: formatMonthForDisplay(currentMonth)
    }];
  }
};
