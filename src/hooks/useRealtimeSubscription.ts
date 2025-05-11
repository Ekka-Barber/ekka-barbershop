
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
   * Enhanced to track changes for specific employee and date
   */
  const setupRealtimeSubscription = useCallback((employeeId: string, selectedDate: Date) => {
    // Create a unique channel name for this subscription
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const channelName = `employee_schedules_${employeeId}_${formattedDate}`;
    
    // Don't create duplicate subscriptions
    if (activeSubscriptions.current[channelName]) {
      console.log(`Subscription for ${channelName} already exists`);
      return;
    }
    
    console.log(`Setting up realtime subscription for ${channelName}`);
    
    const queryKey = ['unavailableSlots', employeeId, formattedDate];
    
    // Fixed filter conditions for the subscription to properly separate employee_id and date
    // Subscribe to changes on the employee_schedules table for this employee and date
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'employee_schedules',
          filter: `employee_id=eq.${employeeId}&date=eq.${formattedDate}`
        },
        (payload) => {
          console.log(`Realtime update received for ${formattedDate}:`, payload);
          
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
    console.log(`Active subscriptions: ${Object.keys(activeSubscriptions.current).join(', ')}`);
    
    return () => {
      if (activeSubscriptions.current[channelName]) {
        supabase.removeChannel(channel);
        delete activeSubscriptions.current[channelName];
        console.log(`Removed subscription for ${channelName}`);
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
      console.log("Cleaned up all realtime subscriptions");
    };
  }, []);

  return {
    setupRealtimeSubscription,
  };
};
