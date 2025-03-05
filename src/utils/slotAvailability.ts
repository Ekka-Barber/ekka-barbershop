
import { isToday, isBefore, addMinutes, format } from "date-fns";
import { UnavailableSlot, hasEnoughConsecutiveTime, isWithinWorkingHours, isAfterMidnight } from "./timeSlotUtils";

/**
 * Checks if a time slot is available based on date, time, and unavailable periods
 */
export const isSlotAvailable = (
  slotMinutes: number,
  unavailableSlots: UnavailableSlot[],
  selectedDate: Date,
  serviceDuration: number = 30, // Default to 30 minutes if not specified
  workingHoursRanges: string[] = []
): boolean => {
  // Format the time for logging
  const slotHours = Math.floor(slotMinutes / 60);
  const slotMins = slotMinutes % 60;
  const timeString = `${slotHours.toString().padStart(2, '0')}:${slotMins.toString().padStart(2, '0')}`;
  
  console.log(`Checking availability for slot ${timeString}`);
  
  // Check if the slot is within working hours
  if (!isWithinWorkingHours(slotMinutes, workingHoursRanges)) {
    console.log(`Slot ${timeString} is not within working hours`);
    return false;
  }

  // If it's today, check if the slot is within minimum booking time
  if (isToday(selectedDate)) {
    const now = new Date();
    const minimumBookingTime = addMinutes(now, 15);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
    
    if (isBefore(slotTime, minimumBookingTime)) {
      console.log(`Slot ${timeString} is before minimum booking time`);
      return false;
    }
  }

  // Check if there's enough consecutive time for the service
  if (!hasEnoughConsecutiveTime(slotMinutes, serviceDuration, unavailableSlots)) {
    console.log(`Slot ${timeString} doesn't have enough consecutive time`);
    return false;
  }
  
  console.log(`Slot ${timeString} is available!`);
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
