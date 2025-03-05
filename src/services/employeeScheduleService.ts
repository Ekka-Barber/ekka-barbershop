
import { supabase } from "@/integrations/supabase/client";
import { UnavailableSlot, normalizeUnavailableSlots } from "@/utils/timeSlotTypes";
import { convertTimeToMinutes, convertMinutesToTime } from "@/utils/timeConversion";
import { addDays, format } from "date-fns";

/**
 * Fetch unavailable slots from Supabase with improved error handling and validation
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
    console.log(`Fetching unavailable slots for employee ${employeeId} on ${formattedDate}`);
    
    // Calculate next day for handling slots that cross midnight
    const currentDate = new Date(formattedDate);
    const nextDate = addDays(currentDate, 1);
    const nextFormattedDate = format(nextDate, 'yyyy-MM-dd');
    
    console.log(`Also fetching slots for next day: ${nextFormattedDate} to handle midnight-crossing`);
    
    // Fetch unavailable slots for both current day and next day
    const { data: currentDaySlots, error: currentDayError } = await supabase
      .from('employee_schedules')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('date', formattedDate)
      .eq('is_available', false);

    if (currentDayError) {
      console.error('Error fetching current day unavailable slots:', currentDayError);
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
      console.error('Error fetching next day unavailable slots:', nextDayError);
      throw new Error(`Failed to fetch next day unavailable slots: ${nextDayError.message}`);
    }

    // Combine both days' slots
    const allUnavailableSlots = [...(currentDaySlots || []), ...(nextDaySlots || [])];
    
    console.log(`Raw unavailable slots:`, allUnavailableSlots);
    
    // Enhanced normalization with validation
    const normalized = normalizeUnavailableSlots(allUnavailableSlots);
    
    // Log the normalized slots for debugging
    console.log('Normalized unavailable slots:');
    normalized.forEach((slot, index) => {
      console.log(`Slot ${index+1}: ${convertMinutesToTime(slot.start_time)}-${convertMinutesToTime(slot.end_time)} (${slot.start_time}-${slot.end_time} mins)`);
    });
    
    return normalized;
  } catch (error) {
    console.error('Exception fetching unavailable slots:', error);
    throw error;
  }
};
