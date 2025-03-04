
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays, parseISO } from "date-fns";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  TimeSlot, 
  UnavailableSlot, 
  convertTimeToMinutes, 
  sortTimeSlots, 
  createTimeSlotsKey, 
  normalizeUnavailableSlots, 
  doesCrossMidnight 
} from "@/utils/timeSlotUtils";
import { isSlotAvailable, isEmployeeAvailable } from "@/utils/slotAvailability";
import { useToast } from "@/hooks/use-toast";

// Cache constants
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useTimeSlots = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const activeSubscriptions = useRef<{ [key: string]: any }>({});

  /**
   * Fetch unavailable slots from Supabase with proper error handling
   */
  const fetchUnavailableSlots = useCallback(async ({
    employeeId,
    formattedDate
  }: {
    employeeId: string;
    formattedDate: string;
  }): Promise<UnavailableSlot[]> => {
    try {
      const { data: unavailableSlots, error } = await supabase
        .from('employee_schedules')
        .select('start_time, end_time')
        .eq('employee_id', employeeId)
        .eq('date', formattedDate)
        .eq('is_available', false);

      if (error) {
        console.error('Error fetching unavailable slots:', error);
        throw new Error(`Failed to fetch unavailable slots: ${error.message}`);
      }

      return normalizeUnavailableSlots(unavailableSlots || []);
    } catch (error) {
      console.error('Exception fetching unavailable slots:', error);
      throw error;
    }
  }, []);

  /**
   * Setup realtime subscription for employee schedules
   */
  const setupRealtimeSubscription = useCallback((employeeId: string, selectedDate: Date) => {
    // Create a unique channel name for this subscription
    const channelName = `employee_schedules_${employeeId}_${format(selectedDate, 'yyyy-MM-dd')}`;
    
    // Don't create duplicate subscriptions
    if (activeSubscriptions.current[channelName]) {
      return;
    }
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const queryKey = ['unavailableSlots', employeeId, formattedDate];
    
    // Subscribe to changes on the employee_schedules table for this employee and date
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'employee_schedules',
          filter: `employee_id=eq.${employeeId}` 
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: queryKey
          });
          
          // Also invalidate any cached time slots for this employee/date
          queryClient.invalidateQueries({
            queryKey: ['timeSlots', employeeId, formattedDate]
          });
          
          // Show a toast notification
          toast({
            title: "Schedule updated",
            description: "The barber's availability has been updated",
            variant: "default"
          });
        }
      )
      .subscribe();
    
    // Store the subscription reference
    activeSubscriptions.current[channelName] = channel;
    
    return () => {
      if (activeSubscriptions.current[channelName]) {
        supabase.removeChannel(channel);
        delete activeSubscriptions.current[channelName];
      }
    };
  }, [queryClient, toast]);

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
        }

        // Create a slot every 30 minutes from start to end time
        let currentSlot = startTime;
        
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
            availableSlots.push({
              time: timeString,
              isAvailable: true
            });
          }
          
          currentSlot = addMinutes(currentSlot, 30);
        }
      }

      return sortTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast({
        title: "Error loading available times",
        description: "Could not load available time slots. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [fetchUnavailableSlots, queryClient, setupRealtimeSubscription, toast]);

  /**
   * Clears the cache for a specific employee-date combination
   */
  const invalidateCache = useCallback((employeeId: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    queryClient.invalidateQueries({
      queryKey: ['unavailableSlots', employeeId, formattedDate]
    });
    queryClient.invalidateQueries({
      queryKey: ['timeSlots', employeeId, formattedDate]
    });
  }, [queryClient]);

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
    
    // Check if employee is off on the selected date
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
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
  }, [generateTimeSlots, queryClient, toast]);

  // Clean up subscriptions when component unmounts
  useEffect(() => {
    return () => {
      // Remove all active subscriptions
      Object.values(activeSubscriptions.current).forEach((channel) => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      activeSubscriptions.current = {};
    };
  }, []);

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable,
    invalidateCache
  };
};
