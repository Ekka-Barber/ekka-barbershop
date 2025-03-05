
import { isToday, isBefore, addMinutes, format } from "date-fns";
import { hasEnoughConsecutiveTime } from "./consecutiveTimeChecker";
import { convertTimeToMinutes, convertMinutesToTime, isAfterMidnight } from "./timeConversion";
import { UnavailableSlot, TimeSlot } from "./timeSlotTypes";
import { isWithinWorkingHours } from "./workingHoursChecker";

/**
 * Checks if a time slot is available based on date, time, and unavailable periods
 * Enhanced with better validation and debug logging
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
  
  console.log(`\n======= Checking availability for ${timeString} =======`);
  console.log(`Date: ${format(selectedDate, 'yyyy-MM-dd')}, After midnight: ${isSlotAfterMidnight}, Duration: ${serviceDuration} mins`);
  
  // Validate unavailable slots
  if (!Array.isArray(unavailableSlots)) {
    console.error("Invalid unavailableSlots format:", unavailableSlots);
    unavailableSlots = [];
  }
  
  console.log(`Working hours ranges: ${workingHoursRanges.join(', ')}`);
  console.log(`Unavailable slots count: ${unavailableSlots.length}`);
  
  // Check if the slot is within working hours
  if (!isWithinWorkingHours(slotMinutes, workingHoursRanges)) {
    console.log(`❌ Slot ${timeString} is not within working hours`);
    return false;
  }

  // Check if the slot is bookable today (not in the past with 15 min buffer)
  // This check should have been done earlier, but we do it again as a safety measure
  if (!isSlotBookableToday(selectedDate, slotMinutes, timeString)) {
    console.log(`❌ Slot ${timeString} is in the past or too soon to book`);
    return false;
  }

  // Check if the service duration would extend beyond working hours
  if (!hasValidServiceEndTime(slotMinutes, serviceDuration, workingHoursRanges)) {
    console.log(`❌ Slot ${timeString} would extend beyond working hours`);
    return false;
  }
  
  // Log unavailable slots for debugging
  logUnavailableSlots(unavailableSlots);

  // Check if there's enough consecutive time for the service
  if (!hasEnoughConsecutiveTime(slotMinutes, serviceDuration, unavailableSlots)) {
    console.log(`❌ Slot ${timeString} doesn't have enough consecutive time due to conflicts`);
    return false;
  }
  
  console.log(`✅ Slot ${timeString} is available!`);
  return true;
};

/**
 * Checks if a slot is bookable on the current day (not in the past)
 * Strictly filters out past time slots with a 15-minute buffer
 */
const isSlotBookableToday = (
  selectedDate: Date,
  slotMinutes: number,
  timeString: string
): boolean => {
  if (!isToday(selectedDate)) {
    return true;
  }
  
  // Get current time with extra precision
  const now = new Date();
  // Require at least 15 minutes lead time for bookings
  const minimumBookingTime = addMinutes(now, 15);
  
  // Create a new date object for the slot time
  const slotTime = new Date(selectedDate);
  slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
  
  // Handle after-midnight slots for today's bookings
  if (isAfterMidnight(timeString)) {
    // Add 1 day to the slot time for after-midnight slots
    slotTime.setDate(slotTime.getDate() + 1);
    console.log(`Adjusted slot time for after-midnight: ${format(slotTime, 'yyyy-MM-dd HH:mm')}`);
  }
  
  // Check if slot time is in the past (with buffer)
  if (isBefore(slotTime, minimumBookingTime)) {
    console.log(`❌ Slot ${timeString} (${format(slotTime, 'HH:mm')}) is in the past or too soon - current time: ${format(now, 'HH:mm')}`);
    return false;
  }
  
  return true;
};

/**
 * Checks if the service end time is valid within working hours
 */
const hasValidServiceEndTime = (
  slotMinutes: number,
  serviceDuration: number,
  workingHoursRanges: string[]
): boolean => {
  const slotEndMinutes = slotMinutes + serviceDuration;
  const slotEndTimeString = convertMinutesToTime(slotEndMinutes);
  const slotEndCrossesMidnight = slotEndMinutes >= 24 * 60;
  
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
      console.log(`❌ Slot would end at ${slotEndTimeString} which is outside working hours`);
      return false;
    }
  } else {
    // For non-midnight-crossing slots, check if end time is within working hours
    if (!isWithinWorkingHours(slotEndMinutes, workingHoursRanges)) {
      console.log(`❌ Slot would end at ${slotEndTimeString} which is outside working hours`);
      return false;
    }
  }
  
  return true;
};

/**
 * Logs unavailable slots for debugging purposes
 */
const logUnavailableSlots = (unavailableSlots: UnavailableSlot[]): void => {
  if (unavailableSlots.length > 0) {
    console.log(`Checking ${unavailableSlots.length} unavailable slots for conflicts...`);
    
    // Log each unavailable slot for debugging
    unavailableSlots.forEach((slot, index) => {
      const start = convertMinutesToTime(slot.start_time);
      const end = convertMinutesToTime(slot.end_time);
      console.log(`- Unavailable slot ${index+1}: ${start} to ${end}`);
    });
  } else {
    console.log("No unavailable slots registered for this day");
  }
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
