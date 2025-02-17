
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTracking, BookingBehavior, BookingData } from "./types";

export const useTrackingData = () => {
  const { data: serviceTracking, isLoading: serviceLoading, error: serviceError } = useQuery({
    queryKey: ['service-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_tracking')
        .select('service_name, action, timestamp')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceTracking[];
    }
  });

  const { data: bookingBehavior, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: ['booking-behavior'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_behavior')
        .select('step, timestamp')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingBehavior[];
    }
  });

  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          device_type,
          browser_info,
          services,
          total_price,
          appointment_date,
          appointment_time,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingData[];
    }
  });

  return {
    serviceTracking,
    bookingBehavior,
    bookingsData,
    isLoading: serviceLoading || bookingLoading || bookingsLoading,
    error: serviceError || bookingError || bookingsError
  };
};
