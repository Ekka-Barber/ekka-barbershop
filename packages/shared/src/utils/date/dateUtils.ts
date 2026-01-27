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
 * Returns the first day of the next month based on the provided date
 * @param dateStr Date string in YYYY-MM-DD format
 */
export const getNextMonth = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

/**
 * Returns the month name from a date string
 * @param dateStr Date string in YYYY-MM-DD format
 */
export const getMonthName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('default', { month: 'long' });
};

/**
 * Checks if a date is within the current month
 * @param dateStr Date string in YYYY-MM-DD format
 */
export const isCurrentMonth = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && 
         date.getMonth() === now.getMonth();
};

/**
 * Formats a month string for display in Arabic
 * @param month Month string in YYYY-MM-01 format
 * @returns Formatted month display string in Arabic
 */
export const formatMonthForDisplay = (month: string): string => {
  try {
    if (!isValidMonth(month)) {
      console.warn('Invalid month format provided to formatMonthForDisplay:', month);
      return getCurrentMonth();
    }
    
    const date = new Date(month);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from month:', month);
      return getCurrentMonth();
    }
    
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  } catch (error) {
    console.error('Error formatting month for display:', error);
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
    
    // Generate 12 months of options (current month and 11 previous months)
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
  } catch (error) {
    console.error('Error generating month options:', error);
    // Fallback to at least current month
    const currentMonth = getCurrentMonth();
    return [{
      value: currentMonth,
      label: formatMonthForDisplay(currentMonth)
    }];
  }
};

/**
 * Validates if a month string is in the correct format and represents a valid date
 * @param month Month string to validate
 * @returns True if month is valid, false otherwise
 */
export const isValidMonth = (month: string): boolean => {
  try {
    if (!month || typeof month !== 'string') {
      return false;
    }
    
    // Check format YYYY-MM-DD where DD should be 01
    const monthRegex = /^\d{4}-\d{2}-01$/;
    if (!monthRegex.test(month)) {
      return false;
    }
    
    const date = new Date(month);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // Allow current month and past months only (no future months)
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const inputMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    return inputMonth <= currentMonth;
  } catch (error) {
    console.error('Error validating month:', error);
    return false;
  }
};

/**
 * Converts a date string to a Date object for use in calendar components
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns Date object or undefined if invalid
 */
export const formatDateForInput = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

/**
 * Converts a Date object to a string in YYYY-MM-DD format for form submission
 * @param date - The Date object to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateFromCalendar = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Format a date string to Arabic format (dd/mm/yyyy)
 * @param dateString The date string to format (YYYY-MM-DD)
 * @param defaultValue Default value to return if date is invalid
 * @returns Formatted date string in Arabic
 */
export const formatDateDDMMYYYY = (dateString: string | null | undefined, defaultValue = 'غير محدد'): string => {
  if (!dateString) return defaultValue;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return defaultValue;
    
    // Format as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
};
