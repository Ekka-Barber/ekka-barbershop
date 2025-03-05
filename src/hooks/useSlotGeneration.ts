
import { useCallback } from "react";
import { format, parse, isBefore, addMinutes, addDays, isToday } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  TimeSlot,
} from "@/utils/timeSlotTypes";
import { sortTimeSlots } from "@/utils/timeSlotSorting";
import { doesCrossMidnight, convertTimeToMinutes, convertMinutesToTime, isAfterMidnight } from "@/utils/timeConversion";
import { fetchUnavailableSlots } from "@/services/employeeScheduleService";
import { isSlotAvailable } from "@/utils/slotAvailability";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

// Cache constants
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const SLOT_INTERVAL = 30; // 30-minute intervals between slots

export const useSlotGeneration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setupRealtimeSubscription } = useRealtimeSubscription();

  /**
   * Generates available time slots based on working hours and unavailable periods
   * Improved to better handle cross-midnight ranges and filter past slots
   */
  const generateTimeSlots = useCallback(async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    const allSlots: TimeSlot[] = []; // All potential slots, even unavailable ones
    
    if (!selectedDate || !employeeId || !workingHoursRanges.length) {
      console.log("Missing required parameters for time slot generation");
      return allSlots;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    console.log(`Generating time slots for ${formattedDate}, employee ${employeeId}`);
    
    // Calculate next day for after-midnight slots
    const nextDay = addDays(selectedDate, 1);
    const nextDayFormatted = format(nextDay, 'yyyy-MM-dd');
    console.log(`Next day for after-midnight slots: ${nextDayFormatted}`);
    
    // Get current time with buffer (for filtering past slots)
    const now = new Date();
    // Add 15 minutes buffer time for bookings
    const bookingBuffer = addMinutes(now, 15);
    
    // Use react-query to fetch and cache unavailable slots
    const queryKey = ['unavailableSlots', employeeId, formattedDate];
    
    try {
      // Fetch unavailable slots using react-query's fetchQuery
      // This now fetches slots for both current day and next day
      const unavailableSlots = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => fetchUnavailableSlots({ employeeId, formattedDate }),
        staleTime: CACHE_EXPIRY,
        gcTime: CACHE_EXPIRY
      });
      
      console.log(`Fetched ${unavailableSlots?.length || 0} unavailable slots for employee ${employeeId}`);
      
      // Set up realtime subscription for this employee and the relevant dates
      setupRealtimeSubscription(employeeId, selectedDate);
      setupRealtimeSubscription(employeeId, nextDay);
      
      // Generate slots for each working hours range
      for (const range of workingHoursRanges) {
        console.log(`Processing working hours range: ${range}`);
        const [start, end] = range.split('-');
        
        const baseDate = selectedDate;
        let startTime = parse(start, 'HH:mm', baseDate);
        let endTime = parse(end, 'HH:mm', baseDate);
        
        // Handle shifts that cross midnight
        const crossesMidnight = doesCrossMidnight(start, end);
        if (crossesMidnight) {
          endTime = addDays(endTime, 1);
          console.log(`Shift crosses midnight: ${start}-${end}`, { 
            startTime: format(startTime, 'HH:mm'), 
            endTime: format(endTime, 'HH:mm'),
            endMinutes: convertTimeToMinutes(end)
          });
        }

        // Create a slot every SLOT_INTERVAL minutes from start to end time
        let currentSlot = startTime;
        
        // Generate slots up to but not including the end time
        while (isBefore(currentSlot, endTime)) {
          const timeString = format(currentSlot, 'HH:mm');
          const slotMinutes = convertTimeToMinutes(timeString);
          
          // Skip past slots if today
          if (isToday(selectedDate)) {
            // Skip slots that are in the past (with 15 min buffer)
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
            
            // If slot is in the past, skip it
            if (isBefore(slotDateTime, bookingBuffer)) {
              console.log(`Skipping past slot: ${timeString}`);
              currentSlot = addMinutes(currentSlot, SLOT_INTERVAL);
              continue;
            }
          }
          
          // For after-midnight slots, we need to indicate they belong to the next day
          const slotDate = isAfterMidnight(timeString) && !isToday(baseDate) ? nextDay : selectedDate;
          
          // Check if slot is available considering all constraints
          const available = isSlotAvailable(
            slotMinutes,
            unavailableSlots || [],
            slotDate,
            serviceDuration,
            workingHoursRanges
          );
          
          // Check if this slot already exists to avoid duplicates
          const slotExists = allSlots.some(slot => slot.time === timeString);
          
          if (!slotExists) {
            // Add the slot to the list with its availability
            allSlots.push({
              time: timeString,
              isAvailable: available
            });
            
            console.log(`Added slot ${timeString}, isAvailable: ${available}, isAfterMidnight: ${isAfterMidnight(timeString)}`);
          }
          
          currentSlot = addMinutes(currentSlot, SLOT_INTERVAL);
        }
      }

      // Log all slots before sorting
      console.log('Generated slots before sorting:', allSlots.map(s => `${s.time} (${s.isAvailable ? 'Available' : 'Unavailable'})`));
      
      // Make sure to sort slots properly with after-midnight slots appearing after regular slots
      const sortedSlots = sortTimeSlots(allSlots);
      
      // Log all slots after sorting
      console.log('Generated slots after sorting:', sortedSlots.map(s => `${s.time} (${s.isAvailable ? 'Available' : 'Unavailable'})`));

      return sortedSlots;
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast({
        title: "Error loading available times",
        description: "Could not load available time slots. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [queryClient, setupRealtimeSubscription, toast]);

  return {
    generateTimeSlots,
  };
};
