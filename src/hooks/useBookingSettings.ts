
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookingSettings {
  id?: string;
  min_advance_time_minutes: number;
  max_advance_days: number;
  slot_duration_minutes: number;
  require_terms_acceptance?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useBookingSettings = () => {
  return useQuery({
    queryKey: ['booking_settings'],
    queryFn: async (): Promise<BookingSettings> => {
      const { data, error } = await supabase
        .from('booking_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching booking settings:', error);
        throw new Error('Failed to fetch booking settings');
      }
      
      // If no settings exist, return defaults
      if (!data) {
        return {
          min_advance_time_minutes: 15,
          max_advance_days: 14,
          slot_duration_minutes: 30,
          require_terms_acceptance: false
        };
      }
      
      return data as BookingSettings;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
