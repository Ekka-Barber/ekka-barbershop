
import { useCallback } from "react";
import { format, parse, isBefore, addMinutes, addDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot, doesCrossMidnight, convertTimeToMinutes, sortTimeSlots } from "@/utils/timeSlotUtils";
import { fetchUnavailableSlots } from "@/services/employeeScheduleService";
import { isSlotAvailable } from "@/utils/slotAvailability";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

// Cache constants
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useSlotGeneration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setupRealtimeSubscription } = useRealtimeSubscription();

  /**
   * Generates available time slots based on working hours and unavailable periods
   */
  const generateTimeSlots = useCallback(async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    const availableSlots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId || !workingHoursRanges.length) {
      return availableSlots;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
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
      
      // Set up realtime subscription for this employee and date
      setupRealtimeSubscription(employeeId, selectedDate);
      
      // Generate slots at 30-minute intervals for each working hours range
      for (const range of workingHoursRanges) {
        const [start, end] = range.split('-');
        
        const baseDate = selectedDate;
        const startTime = parse(start, 'HH:mm', baseDate);
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

        // Create a slot every 30 minutes from start to end time
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
          
          // Only add available slots
          if (available) {
            console.log(`Adding available slot: ${timeString}`);
            availableSlots.push({
              time: timeString,
              isAvailable: true
            });
          }
          
          currentSlot = addMinutes(currentSlot, 30);
        }
      }

      // Log all slots before sorting
      console.log('Generated slots before sorting:', availableSlots.map(s => s.time));
      
      // Make sure to sort slots properly with after-midnight slots appearing after regular slots
      const sortedSlots = sortTimeSlots(availableSlots);
      
      // Log all slots after sorting
      console.log('Generated slots after sorting:', sortedSlots.map(s => s.time));

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
