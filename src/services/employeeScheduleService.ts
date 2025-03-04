
import { supabase } from "@/integrations/supabase/client";
import { UnavailableSlot, normalizeUnavailableSlots } from "@/utils/timeSlotUtils";

/**
 * Fetch unavailable slots from Supabase with proper error handling
 */
export const fetchUnavailableSlots = async ({
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
};
