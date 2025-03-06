
import { format, addDays } from "date-fns";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "@/utils/timeSlotTypes";
import { useToast } from "@/hooks/use-toast";
import { useSlotGeneration } from "./useSlotGeneration";
import { useEmployeeAvailability } from "./useEmployeeAvailability";
import { isEmployeeAvailable } from "@/utils/slotAvailability";

// Cache constants
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useTimeSlots = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { generateTimeSlots } = useSlotGeneration();
  const { getEmployeeWorkingHours, isEmployeeOffDay, hasPreviousDayCrossMidnightShifts } = useEmployeeAvailability();

  /**
   * Clears the cache for a specific employee-date combination
   * Enhanced to also invalidate next day for after-midnight slots
   */
  const invalidateCache = useCallback((employeeId: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Invalidate current day
    queryClient.invalidateQueries({
      queryKey: ['unavailableSlots', employeeId, formattedDate]
    });
    queryClient.invalidateQueries({
      queryKey: ['timeSlots', employeeId, formattedDate]
    });
    
    // Also invalidate next day for after-midnight slots
    const nextDay = addDays(date, 1);
    const nextDayFormatted = format(nextDay, 'yyyy-MM-dd');
    
    queryClient.invalidateQueries({
      queryKey: ['unavailableSlots', employeeId, nextDayFormatted]
    });
    queryClient.invalidateQueries({
      queryKey: ['timeSlots', employeeId, nextDayFormatted]
    });
  }, [queryClient]);

  /**
   * Gets available time slots for a specific employee and date with memoization
   */
  const getAvailableTimeSlots = useCallback(async (
    employee: any,
    selectedDate: Date | undefined,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    // Check if employee is completely off on the selected date (no regular shifts and no late night shifts)
    if (isEmployeeOffDay(employee, selectedDate) && !hasPreviousDayCrossMidnightShifts(employee, selectedDate)) {
      return [];
    }
    
    const workingHours = getEmployeeWorkingHours(employee, selectedDate);
    
    // Create a query key for caching the result
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const queryKey = ['timeSlots', employee.id, formattedDate];
    
    try {
      // Use queryClient.fetchQuery to fetch and cache the result
      return await queryClient.fetchQuery({
        queryKey,
        queryFn: () => generateTimeSlots(workingHours, selectedDate, employee.id, serviceDuration),
        staleTime: CACHE_EXPIRY,
        gcTime: CACHE_EXPIRY
      });
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error loading schedule",
        description: "Could not load barber's schedule. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [generateTimeSlots, queryClient, toast, getEmployeeWorkingHours, isEmployeeOffDay, hasPreviousDayCrossMidnightShifts]);

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable,
    invalidateCache
  };
};
