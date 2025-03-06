
import { useCallback } from "react";
import { format, addDays } from "date-fns";
import { isEmployeeAvailable } from "@/utils/slotAvailability";

export const useEmployeeAvailability = () => {
  /**
   * Check if an employee is available on a specific date
   */
  const checkEmployeeAvailability = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    return isEmployeeAvailable(employee, selectedDate);
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
      // Check if end time is less than start time (crosses midnight)
      const startHour = parseInt(start.split(':')[0], 10);
      const endHour = parseInt(end.split(':')[0], 10);
      const endMin = parseInt(end.split(':')[1], 10);
      
      // Consider it crossing midnight if end hour is less than start hour
      // or if end time is exactly midnight (00:00)
      return endHour < startHour || (endHour === 0 && endMin === 0);
    });
    
    // Combine current day's shifts with previous day's shifts that cross midnight
    return [...workingHours, ...crossMidnightShifts];
  }, []);

  /**
   * Check if employee is off on a specific date
   * Modified to ensure after-midnight slots from previous day are still available
   * even if employee is off on the current day
   */
  const isEmployeeOffDay = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.off_days) return false;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const isOff = employee.off_days.includes(dateString);
    
    if (isOff) {
      // Even if employee is off today, check if there are shifts from previous day
      // that cross midnight (which would make early morning slots available)
      const prevDate = addDays(selectedDate, -1);
      const prevDayName = format(prevDate, 'EEEE').toLowerCase();
      const prevDayWorkingHours = employee.working_hours?.[prevDayName] || [];
      
      // If there are shifts from previous day that cross midnight, employee is not completely off
      const hasCrossMidnightShifts = prevDayWorkingHours.some((shift: string) => {
        const [start, end] = shift.split('-');
        const startHour = parseInt(start.split(':')[0], 10);
        const endHour = parseInt(end.split(':')[0], 10);
        return endHour < startHour || end === '00:00';
      });
      
      // If previous day has shifts crossing midnight, we shouldn't consider employee completely off
      // for the purpose of the early morning slots
      return !hasCrossMidnightShifts;
    }
    
    return isOff;
  }, []);

  return {
    checkEmployeeAvailability,
    getEmployeeWorkingHours,
    isEmployeeOffDay,
  };
};
