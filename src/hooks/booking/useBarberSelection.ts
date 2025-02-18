
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/booking";
import { toast } from "sonner";

interface BarberAvailability {
  isAvailable: boolean;
  currentBookings: number;
  nextAvailableTime?: string;
  conflicts?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export const useBarberSelection = () => {
  const checkBarberAvailability = async (
    barberId: string,
    date: Date,
    time: string
  ): Promise<BarberAvailability> => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', date.toISOString().split('T')[0])
        .eq('appointment_time', time);

      if (error) throw error;

      if (bookings && bookings.length > 0) {
        // Find next available time
        const nextTime = await findNextAvailableTime(barberId, date);
        return {
          isAvailable: false,
          currentBookings: bookings.length,
          nextAvailableTime: nextTime,
          conflicts: bookings.map(b => ({
            startTime: b.appointment_time,
            endTime: b.appointment_time // Add duration calculation if needed
          }))
        };
      }

      return {
        isAvailable: true,
        currentBookings: 0
      };
    } catch (error) {
      console.error('Error checking barber availability:', error);
      toast.error('Failed to check barber availability. Please try again.');
      throw error;
    }
  };

  const findNextAvailableTime = async (
    barberId: string,
    date: Date
  ): Promise<string | undefined> => {
    // Implementation for finding next available time
    // ... (implement the logic for finding the next available time)
    return undefined;
  };

  return {
    checkBarberAvailability,
    findNextAvailableTime
  };
};
