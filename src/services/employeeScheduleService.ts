
import { supabase } from "@/integrations/supabase/client";
import { UnavailableSlot, normalizeUnavailableSlots } from "@/utils/timeSlotTypes";
import { addDays, format } from "date-fns";

/**
 * Fetch unavailable slots from Supabase
 * Enhanced to fetch slots for both current day and next day to handle midnight-crossing slots
 */
export const fetchUnavailableSlots = async ({
  employeeId,
  formattedDate
}: {
  employeeId: string;
  formattedDate: string;
}): Promise<UnavailableSlot[]> => {
  try {
    // Calculate next day for handling slots that cross midnight
    const currentDate = new Date(formattedDate);
    const nextDate = addDays(currentDate, 1);
    const nextFormattedDate = format(nextDate, 'yyyy-MM-dd');
    
    // Fetch unavailable slots for current day
    const { data: currentDaySlots, error: currentDayError } = await supabase
      .from('employee_schedules')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('date', formattedDate)
      .eq('is_available', false);

    if (currentDayError) {
      throw new Error(`Failed to fetch current day unavailable slots: ${currentDayError.message}`);
    }
    
    // Fetch next day's unavailable slots
    const { data: nextDaySlots, error: nextDayError } = await supabase
      .from('employee_schedules')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('date', nextFormattedDate)
      .eq('is_available', false);

    if (nextDayError) {
      throw new Error(`Failed to fetch next day unavailable slots: ${nextDayError.message}`);
    }

    // Combine both days' slots
    const allUnavailableSlots = [...(currentDaySlots || []), ...(nextDaySlots || [])];
    
    // Enhanced normalization with validation
    return normalizeUnavailableSlots(allUnavailableSlots);
  } catch (error) {
    console.error('Exception fetching unavailable slots:', error);
    throw error;
  }
};
