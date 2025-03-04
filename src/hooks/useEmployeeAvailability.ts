
import { useCallback } from "react";
import { format } from "date-fns";
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
   */
  const getEmployeeWorkingHours = useCallback((employee: any, selectedDate: Date | undefined): string[] => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    return employee.working_hours[dayName] || [];
  }, []);

  /**
   * Check if employee is off on a specific date
   */
  const isEmployeeOffDay = useCallback((employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.off_days) return false;
    return employee.off_days.includes(format(selectedDate, 'yyyy-MM-dd'));
  }, []);

  return {
    checkEmployeeAvailability,
    getEmployeeWorkingHours,
    isEmployeeOffDay,
  };
};
