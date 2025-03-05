
import { useCallback } from "react";
import { format, parse, isBefore, addMinutes, addDays } from "date-fns";
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
   * Improved to better handle cross-midnight ranges and provide more consistent results
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
    
    // Use react-query to fetch and cache unavailable slots
    const queryKey = ['unavailableSlots', employeeId, formattedDate];
    
    try {
      // Fetch unavailable slots using react-query's fetchQuery
      const unavailableSlots = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => fetchUnavailableSlots({ employeeId, formattedDate }),
        staleTime: CACHE_EXPIRY,
        gcTime: CACHE_EXPIRY
      });
      
      console.log(`Fetched ${unavailableSlots?.length || 0} unavailable slots for employee ${employeeId}`);
      
      // Set up realtime subscription for this employee and date
      setupRealtimeSubscription(employeeId, selectedDate);
      
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
          
          // Check if slot is available considering all constraints
          const available = isSlotAvailable(
            slotMinutes,
            unavailableSlots || [],
            selectedDate,
            serviceDuration,
            workingHoursRanges
          );
          
          // Check if this slot already exists to avoid duplicates
          const slotExists = allSlots.some(slot => slot.time === timeString);
          
          if (!slotExists) {
            // Add the slot regardless of availability - we'll filter by availability in the UI
            console.log(`Adding slot: ${timeString} (Available: ${available}, After midnight: ${isAfterMidnight(timeString)})`);
            allSlots.push({
              time: timeString,
              isAvailable: available
            });
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
