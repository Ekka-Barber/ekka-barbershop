
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays, parseISO } from "date-fns";
import { useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlot, UnavailableSlot, convertTimeToMinutes, sortTimeSlots, createTimeSlotsKey, normalizeUnavailableSlots } from "@/utils/timeSlotUtils";
import { isSlotAvailable, isEmployeeAvailable } from "@/utils/slotAvailability";

// Simple in-memory cache
const timeSlotCache: Record<string, { data: TimeSlot[], timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useTimeSlots = () => {
  /**
   * Fetch unavailable slots from Supabase with proper error handling
   */
  const fetchUnavailableSlots = useCallback(async (
    employeeId: string,
    formattedDate: string
  ): Promise<UnavailableSlot[]> => {
    try {
      const { data: unavailableSlots, error } = await supabase
        .from('employee_schedules')
        .select('start_time, end_time')
        .eq('employee_id', employeeId)
        .eq('date', formattedDate)
        .eq('is_available', false);

      if (error) {
        console.error('Error fetching unavailable slots:', error);
        return [];
      }

      return normalizeUnavailableSlots(unavailableSlots || []);
    } catch (error) {
      console.error('Exception fetching unavailable slots:', error);
      return [];
    }
  }, []);

  /**
   * Generates only available time slots for a specific date and employee
   */
  const generateTimeSlots = useCallback(async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    const availableSlots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return availableSlots;

    // Create a cache key
    const cacheKey = createTimeSlotsKey(employeeId, selectedDate);
    
    // Check cache first
    const cachedData = timeSlotCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
      return cachedData.data;
    }

    // Get all unavailable slots for the day in one query
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const unavailableSlots = await fetchUnavailableSlots(employeeId, formattedDate);

    const now = new Date();
    const minimumBookingTime = addMinutes(now, 15);

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = selectedDate;
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle shifts that cross midnight
      const crossesMidnight = isAfter(startTime, endTime);
      if (crossesMidnight) {
        endTime = addDays(endTime, 1);
      }

      let currentSlot = startTime;
      
      while (isBefore(currentSlot, endTime)) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        // Skip adding the 00:00 slot unless we're handling a shift that crosses midnight
        if (timeString === '00:00' && !crossesMidnight) {
          currentSlot = addMinutes(currentSlot, 30);
          continue;
        }

        // Check if slot is available (considering minimum booking time and conflicts)
        const available = isSlotAvailable(
          slotMinutes,
          unavailableSlots,
          selectedDate,
          serviceDuration
        );
        
        // Only add available slots
        if (available) {
          availableSlots.push({
            time: timeString,
            isAvailable: true
          });
        }
        
        currentSlot = addMinutes(currentSlot, 30);
      }
    }

    const sortedSlots = sortTimeSlots(availableSlots);
    
    // Cache the result
    timeSlotCache[cacheKey] = {
      data: sortedSlots,
      timestamp: Date.now()
    };
    
    return sortedSlots;
  }, [fetchUnavailableSlots]);

  /**
   * Clears the cache for a specific employee-date combination
   */
  const invalidateCache = useCallback((employeeId: string, date: Date) => {
    const cacheKey = createTimeSlotsKey(employeeId, date);
    delete timeSlotCache[cacheKey];
  }, []);

  /**
   * Gets available time slots for a specific employee and date with memoization
   */
  const getAvailableTimeSlots = useCallback(async (
    employee: any,
    selectedDate: Date | undefined,
    serviceDuration: number = 30
  ) => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(workingHours, selectedDate, employee.id, serviceDuration);
  }, [generateTimeSlots]);

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable,
    invalidateCache
  };
};
