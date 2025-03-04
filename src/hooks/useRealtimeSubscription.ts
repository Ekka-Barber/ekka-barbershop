
import { useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const activeSubscriptions = useRef<{ [key: string]: any }>({});

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
    setupRealtimeSubscription,
  };
};
