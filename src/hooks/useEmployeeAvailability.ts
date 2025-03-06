
import { useCallback } from "react";
import { format, addDays } from "date-fns";
import { doesCrossMidnight } from "@/utils/timeConversion";

export const useEmployeeAvailability = () => {
  /**
   * Check if an employee is available on a specific date
   */
  const checkEmployeeAvailability = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.working_hours) return false;
    
    // First check if this date is in the employee's off days
    if (isEmployeeOffDay(employee, selectedDate)) {
      // Even if employee is off, check if there are shifts from previous day
      // that cross midnight (which would make early morning slots available)
      return hasPreviousDayCrossMidnightShifts(employee, selectedDate);
    }
    
    // Check if employee has working hours for this day
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    return workingHours.length > 0;
  }, []);

  /**
   * Check if there are shifts from the previous day that cross midnight
   * This is used when an employee is off on the current day but might
   * still be available for early morning slots
   */
  const hasPreviousDayCrossMidnightShifts = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.working_hours) return false;
    
    const prevDate = addDays(selectedDate, -1);
    const prevDayName = format(prevDate, 'EEEE').toLowerCase();
    const prevDayWorkingHours = employee.working_hours?.[prevDayName] || [];
    
    // Check if any shifts from previous day cross midnight
    return prevDayWorkingHours.some((shift: string) => {
      const [start, end] = shift.split('-');
      return doesCrossMidnight(start, end);
    });
  }, []);

  /**
   * Get working hours for an employee on a specific date
   * Enhanced to include previous day's after-midnight hours if needed
   */
  const getEmployeeWorkingHours = useCallback((employee: any, selectedDate: Date | undefined): string[] => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    // Also check previous day for shifts that cross midnight
    const prevDate = addDays(selectedDate, -1);
    const prevDayName = format(prevDate, 'EEEE').toLowerCase();
    const prevDayWorkingHours = employee.working_hours[prevDayName] || [];
    
    // Find any shifts from previous day that cross midnight
    const crossMidnightShifts = prevDayWorkingHours.filter((shift: string) => {
      const [start, end] = shift.split('-');
      return doesCrossMidnight(start, end);
    });
    
    // Combine current day's shifts with previous day's shifts that cross midnight
    return [...workingHours, ...crossMidnightShifts];
  }, []);

  /**
   * Check if employee is off on a specific date
   */
  const isEmployeeOffDay = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.off_days) return false;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return employee.off_days.includes(dateString);
  }, []);

  return {
    checkEmployeeAvailability,
    getEmployeeWorkingHours,
    isEmployeeOffDay,
    hasPreviousDayCrossMidnightShifts,
  };
};
