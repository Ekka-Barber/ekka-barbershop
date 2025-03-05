
import { isToday, isBefore, addMinutes, format } from "date-fns";
import { 
  UnavailableSlot, 
  hasEnoughConsecutiveTime, 
  isWithinWorkingHours, 
  isAfterMidnight,
  convertTimeToMinutes,
  convertMinutesToTime
} from "./timeSlotUtils";

/**
 * Checks if a time slot is available based on date, time, and unavailable periods
 * Improved to handle cross-midnight slots properly and provide better logging
 */
export const isSlotAvailable = (
  slotMinutes: number,
  unavailableSlots: UnavailableSlot[],
  selectedDate: Date,
  serviceDuration: number = 30, // Default to 30 minutes if not specified
  workingHoursRanges: string[] = []
): boolean => {
  // Format the time for logging
  const timeString = convertMinutesToTime(slotMinutes);
  
  console.log(`Checking availability for slot ${timeString}`);
  
  // Check if the slot is within working hours
  if (!isWithinWorkingHours(slotMinutes, workingHoursRanges)) {
    console.log(`Slot ${timeString} is not within working hours`);
    return false;
  }

  // If it's today, check if the slot is within minimum booking time (15 minutes from now)
  if (isToday(selectedDate)) {
    const now = new Date();
    const minimumBookingTime = addMinutes(now, 15);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
    
    // Handle after-midnight slots for today's bookings
    if (isAfterMidnight(timeString)) {
      // Add 1 day to the slot time for after-midnight slots
      slotTime.setDate(slotTime.getDate() + 1);
    }
    
    if (isBefore(slotTime, minimumBookingTime)) {
      console.log(`Slot ${timeString} is before minimum booking time`);
      return false;
    }
  }

  // Check if the slot end time extends beyond the working hours
  const slotEndMinutes = slotMinutes + serviceDuration;
  const slotEndTimeString = convertMinutesToTime(slotEndMinutes);
  const slotEndCrossesMidnight = slotEndMinutes >= 24 * 60;
  
  // Check if service duration would cross outside of working hours
  // This is a more thorough check than just checking the start time
  if (slotEndCrossesMidnight) {
    // If end time crosses midnight, we need to check if that's allowed in working hours
    const adjustedEndMinutes = slotEndMinutes % (24 * 60);
    let isEndTimeValid = false;
    
    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      const endMinutes = convertTimeToMinutes(end);
      const rangeStartMinutes = convertTimeToMinutes(start);
      const rangeCrossesMidnight = endMinutes < rangeStartMinutes;
      
      if (rangeCrossesMidnight && adjustedEndMinutes <= endMinutes) {
        isEndTimeValid = true;
        break;
      }
    }
    
    if (!isEndTimeValid) {
      console.log(`Slot ${timeString} would end at ${slotEndTimeString} which is outside working hours`);
      return false;
    }
  } else {
    // For non-midnight-crossing slots, check if end time is within working hours
    if (!isWithinWorkingHours(slotEndMinutes, workingHoursRanges)) {
      console.log(`Slot ${timeString} would end at ${slotEndTimeString} which is outside working hours`);
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
 * Improved to handle off days correctly
 */
export const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
  if (!selectedDate || !employee?.working_hours) return false;
  
  const dayName = format(selectedDate, 'EEEE').toLowerCase();
  const workingHours = employee.working_hours[dayName] || [];
  
  // Check if this date is marked as off day
  if (Array.isArray(employee.off_days) && employee.off_days.includes(format(selectedDate, 'yyyy-MM-dd'))) {
    console.log(`Employee ${employee.name} is off on ${format(selectedDate, 'yyyy-MM-dd')}`);
    return false;
  }
  
  // Employee is available if they have working hours for this day
  return workingHours.length > 0;
};
