
import { isToday, isBefore, addMinutes, format } from "date-fns";
import { UnavailableSlot, hasEnoughConsecutiveTime, convertTimeToMinutes } from "./timeSlotUtils";
import { BookingSettings } from "@/hooks/useBookingSettings";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a time slot is available based on date, time, and unavailable periods
 */
export const isSlotAvailable = (
  slotMinutes: number,
  unavailableSlots: UnavailableSlot[],
  selectedDate: Date,
  serviceDuration: number = 30, // Default to 30 minutes if not specified
  bookingSettings?: BookingSettings
): boolean => {
  // If it's today, check if the slot is within minimum booking time
  if (isToday(selectedDate)) {
    const now = new Date();
    const minAdvanceMinutes = bookingSettings?.min_advance_time_minutes || 15;
    const minimumBookingTime = addMinutes(now, minAdvanceMinutes);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
    
    if (isBefore(slotTime, minimumBookingTime)) {
      console.log('Slot not available due to minimum booking time:', {
        slotTime: format(slotTime, 'HH:mm'),
        minimumBookingTime: format(minimumBookingTime, 'HH:mm'),
        minAdvanceMinutes
      });
      return false;
    }
  }

  // Check if there's enough consecutive time for the service
  if (!hasEnoughConsecutiveTime(slotMinutes, serviceDuration, unavailableSlots)) {
    console.log('Slot not available due to insufficient consecutive time:', {
      startTime: slotMinutes,
      requiredDuration: serviceDuration
    });
    return false;
  }
  
  return true;
};

/**
 * Checks if an employee is available on a specific date
 */
export const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
  if (!selectedDate || !employee?.working_hours) return false;
  
  const dayName = format(selectedDate, 'EEEE').toLowerCase();
  const workingHours = employee.working_hours[dayName] || [];
  
  if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
    return false;
  }
  
  return workingHours.length > 0;
};

/**
 * Checks if a service is available at a specific branch
 */
export const isServiceAvailableAtBranch = async (
  serviceId: string,
  branchId: string
): Promise<boolean> => {
  try {
    // Query the service_branch_availability table
    const { data, error } = await supabase
      .from('service_branch_availability')
      .select('is_available')
      .eq('service_id', serviceId)
      .eq('branch_id', branchId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking service availability:', error);
      return true; // Default to available in case of error
    }
    
    // If no record exists, assume service is available (default behavior)
    if (!data) return true;
    
    return data.is_available;
  } catch (error) {
    console.error('Exception checking service availability:', error);
    return true; // Default to available in case of error
  }
};

/**
 * Fetches all services available at a specific branch
 */
export const getAvailableServicesForBranch = async (
  branchId: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('service_branch_availability')
      .select('service_id')
      .eq('branch_id', branchId)
      .eq('is_available', true);
      
    if (error) {
      console.error('Error fetching available services:', error);
      return [];
    }
    
    return data.map(item => item.service_id);
  } catch (error) {
    console.error('Exception fetching available services:', error);
    return [];
  }
};
