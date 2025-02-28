
import { isToday, isBefore, addMinutes, format } from "date-fns";
import { UnavailableSlot, hasEnoughConsecutiveTime, convertTimeToMinutes } from "./timeSlotUtils";
import { BookingSettings } from "@/hooks/useBookingSettings";

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
