import { useCallback } from "react";
import { format, parse, isBefore, isEqual, addMinutes, addDays, isToday } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "@/utils/timeSlotTypes";
import { doesCrossMidnight, convertTimeToMinutes, convertMinutesToTime, isAfterMidnight } from "@/utils/timeConversion";
import { fetchUnavailableSlots } from "@/services/employeeScheduleService";
import { isSlotAvailable } from "@/utils/slotAvailability";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscriptionSetup } from "./useRealtimeSubscription";

// Cache constants
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const SLOT_INTERVAL = 30; // 30-minute intervals between slots

export const useSlotGeneration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setupRealtimeSubscription } = useRealtimeSubscriptionSetup();

  /**
   * Generates available time slots based on working hours and unavailable periods
   */
  const generateTimeSlots = useCallback(async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    const allSlots: TimeSlot[] = []; // All potential slots, even unavailable ones
    
    if (!selectedDate || !employeeId || !workingHoursRanges.length) {
      return allSlots;
    }

    console.log("Working hours ranges:", workingHoursRanges);
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Get current time with buffer (for filtering past slots)
    const now = new Date();
    // Add 15 minutes buffer time for bookings
    const bookingBuffer = addMinutes(now, 15);
    
    // Use react-query to fetch and cache unavailable slots
    const queryKey = ['unavailableSlots', employeeId, formattedDate];
    
    try {
      // Fetch unavailable slots for both current day and next day
      const unavailableSlots = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => fetchUnavailableSlots({ employeeId, formattedDate }),
        staleTime: CACHE_EXPIRY,
        gcTime: CACHE_EXPIRY
      });
      
      // Set up realtime subscription for this employee and date
      setupRealtimeSubscription(employeeId, selectedDate);
      
      // Generate slots for each working hours range
      for (const range of workingHoursRanges) {
        const [start, end] = range.split('-');
        
        const baseDate = selectedDate;
        let startTime = parse(start, 'HH:mm', baseDate);
        let endTime = parse(end, 'HH:mm', baseDate);
        
        // Handle shifts that cross midnight
        const crossesMidnight = doesCrossMidnight(start, end);
        if (crossesMidnight) {
          endTime = addDays(endTime, 1);
        }

        console.log(`Processing range ${start}-${end}, crosses midnight: ${crossesMidnight}`);

        // Create a slot every SLOT_INTERVAL minutes from start to end time
        let currentSlot = startTime;
        
        // Generate slots up to and including the end time if it's midnight (00:00)
        while (isBefore(currentSlot, endTime) || 
              (format(endTime, 'HH:mm') === '00:00' && isEqual(currentSlot, endTime))) {
          const timeString = format(currentSlot, 'HH:mm');
          const slotMinutes = convertTimeToMinutes(timeString);
          const slotIsAfterMidnight = isAfterMidnight(timeString);
          
          // Skip past slots only for today
          if (isToday(selectedDate)) {
            // Create a datetime object for this slot
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
            
            // If the slot is after midnight, it's actually for tomorrow
            if (slotIsAfterMidnight) {
              slotDateTime.setDate(slotDateTime.getDate() + 1);
            }
            
            // If slot is in the past or within buffer time, skip it
            if (isBefore(slotDateTime, bookingBuffer)) {
              currentSlot = addMinutes(currentSlot, SLOT_INTERVAL);
              continue; // Skip to next iteration
            }
          }
          
          // For after-midnight slots, we need to indicate they belong to the next day
          const slotDate = slotIsAfterMidnight ? addDays(selectedDate, 1) : selectedDate;
          
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
              isAvailable: available,
              isAfterMidnight: slotIsAfterMidnight
            });
          }
          
          // Break the loop if we've just processed 00:00 and that's the end time
          if (timeString === '00:00' && format(endTime, 'HH:mm') === '00:00') {
            break;
          }
          
          currentSlot = addMinutes(currentSlot, SLOT_INTERVAL);
        }
      }

      // Sort the slots - first by time of day (before/after midnight), then by time
      return allSlots.sort((a, b) => {
        const aIsAfterMidnight = isAfterMidnight(a.time);
        const bIsAfterMidnight = isAfterMidnight(b.time);
        
        // If one is after midnight and one isn't, the after-midnight slot comes later
        if (aIsAfterMidnight && !bIsAfterMidnight) return 1;
        if (!aIsAfterMidnight && bIsAfterMidnight) return -1;
        
        // If both slots are in the same time period, sort chronologically
        const aMinutes = convertTimeToMinutes(a.time);
        const bMinutes = convertTimeToMinutes(b.time);
        return aMinutes - bMinutes;
      });

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
