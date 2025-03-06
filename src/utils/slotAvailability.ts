
import { isToday, isBefore, addMinutes } from "date-fns";
import { convertTimeToMinutes, convertMinutesToTime, isAfterMidnight } from "./timeConversion";
import { UnavailableSlot } from "./timeSlotTypes";
import { isWithinWorkingHours } from "./workingHoursChecker";

/**
 * Checks if a time slot is available based on date, time, and unavailable periods
 */
export const isSlotAvailable = (
  slotMinutes: number,
  unavailableSlots: UnavailableSlot[],
  selectedDate: Date,
  serviceDuration: number = 30,
  workingHoursRanges: string[] = []
): boolean => {
  // Format the time for logging
  const timeString = convertMinutesToTime(slotMinutes);
  const isSlotAfterMidnight = isAfterMidnight(timeString);
  
  // Validate unavailable slots
  if (!Array.isArray(unavailableSlots)) {
    unavailableSlots = [];
  }
  
  // Check if the slot is within working hours
  if (!isWithinWorkingHours(slotMinutes, workingHoursRanges)) {
    return false;
  }

  // Create a Date object that represents the exact date and time of this slot
  const slotDateTime = new Date(selectedDate);
  slotDateTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
  
  // If slot is after midnight, it belongs to the next day
  if (isSlotAfterMidnight) {
    slotDateTime.setDate(slotDateTime.getDate() + 1);
  }
  
  // Check if the slot is bookable today (not in the past with 15 min buffer)
  if (isToday(selectedDate)) {
    // Get current time
    const now = new Date();
    // Require at least 15 minutes lead time for bookings
    const minimumBookingTime = addMinutes(now, 15);
    
    // Check if slot time is in the past (with buffer)
    if (isBefore(slotDateTime, minimumBookingTime)) {
      return false;
    }
  }

  // Check if the service duration would extend beyond working hours
  const slotEndMinutes = slotMinutes + serviceDuration;
  if (!hasValidServiceEndTime(slotMinutes, serviceDuration, workingHoursRanges)) {
    return false;
  }
  
  // Check if there's enough consecutive time for the service by checking for conflicts
  // with unavailable slots
  return !hasConflictWithUnavailableSlots(slotMinutes, serviceDuration, unavailableSlots);
};

/**
 * Checks if a service end time is valid within working hours
 */
const hasValidServiceEndTime = (
  slotMinutes: number,
  serviceDuration: number,
  workingHoursRanges: string[]
): boolean => {
  const slotEndMinutes = slotMinutes + serviceDuration;
  const slotEndCrossesMidnight = slotEndMinutes >= 24 * 60;
  
  if (slotEndCrossesMidnight) {
    // If service end time crosses midnight, check if that's allowed in working hours
    const adjustedEndMinutes = slotEndMinutes % (24 * 60);
    
    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      const endMinutes = convertTimeToMinutes(end);
      const startMinutes = convertTimeToMinutes(start);
      const rangeCrossesMidnight = endMinutes < startMinutes || end === '00:00';
      
      // Allow service to end exactly at the end time (including midnight)
      if (rangeCrossesMidnight && adjustedEndMinutes <= endMinutes) {
        return true;
      }
    }
    
    return false;
  } else {
    // For non-midnight-crossing slots, check if end time is within working hours
    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      const endMinutes = convertTimeToMinutes(end);
      
      // Allow the service to end exactly at the end of working hours
      if (slotEndMinutes <= endMinutes) {
        return true;
      }
    }
    
    return false;
  }
};

/**
 * Checks if a time slot has any conflict with unavailable slots
 */
const hasConflictWithUnavailableSlots = (
  slotStartMinutes: number,
  serviceDuration: number,
  unavailableSlots: UnavailableSlot[]
): boolean => {
  const slotEndMinutes = slotStartMinutes + serviceDuration;
  
  for (const slot of unavailableSlots) {
    // Ensure slot times are numbers
    const slotStart = typeof slot.start_time === 'number' 
      ? slot.start_time 
      : parseInt(String(slot.start_time));
    
    const slotEnd = typeof slot.end_time === 'number' 
      ? slot.end_time 
      : parseInt(String(slot.end_time));
    
    if (isNaN(slotStart) || isNaN(slotEnd)) {
      continue; // Skip invalid slots
    }

    // Handle slots that cross midnight
    const slotCrossesMidnight = slotEnd < slotStart;
    let overlap = false;
    
    if (slotCrossesMidnight) {
      // For slots that cross midnight, check two time periods
      overlap = (slotStartMinutes < slotEnd && slotEndMinutes > 0) || // Overlap in 00:00 to slotEnd period
               (slotStartMinutes < 1440 && slotEndMinutes > slotStart); // Overlap in slotStart to 23:59 period
    } else {
      // Standard overlap check for non-midnight-crossing slots
      overlap = (
        // Case 1: Slot starts during unavailable period
        (slotStartMinutes >= slotStart && slotStartMinutes < slotEnd) ||
        // Case 2: Slot ends during unavailable period
        (slotEndMinutes > slotStart && slotEndMinutes <= slotEnd) ||
        // Case 3: Slot completely contains unavailable period
        (slotStartMinutes <= slotStart && slotEndMinutes >= slotEnd)
      );
    }
    
    if (overlap) {
      return true; // Found conflict
    }
  }
  
  return false; // No conflict found
};

/**
 * Checks if an employee is available on a specific date
 */
export const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
  if (!selectedDate || !employee?.working_hours) return false;
  
  // First check if employee is off on this date
  if (Array.isArray(employee.off_days) && employee.off_days.includes(format(selectedDate, 'yyyy-MM-dd'))) {
    // Check if there are shifts from previous day that cross midnight
    const prevDate = addDays(selectedDate, -1);
    const prevDayName = format(prevDate, 'EEEE').toLowerCase();
    const prevDayWorkingHours = employee.working_hours?.[prevDayName] || [];
    
    // If any shifts from previous day cross midnight, employee is available for early morning
    const hasCrossMidnightShifts = prevDayWorkingHours.some((shift: string) => {
      const [start, end] = shift.split('-');
      return doesCrossMidnight(start, end);
    });
    
    return hasCrossMidnightShifts;
  }
  
  // Check if employee has working hours for this day
  const dayName = format(selectedDate, 'EEEE').toLowerCase();
  const workingHours = employee.working_hours[dayName] || [];
  
  return workingHours.length > 0;
};

// Import the format function from date-fns
import { format } from "date-fns";
import { doesCrossMidnight } from "./timeConversion";
