
import { supabase } from "@/integrations/supabase/client";
import { UnavailableSlot, normalizeUnavailableSlots, convertTimeToMinutes, convertMinutesToTime } from "@/utils/timeSlotUtils";

/**
 * Fetch unavailable slots from Supabase with improved error handling and validation
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

    console.log(`Raw unavailable slots:`, unavailableSlots);
    
    // Enhanced normalization with validation
    const normalized = normalizeUnavailableSlots(unavailableSlots || []);
    
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
