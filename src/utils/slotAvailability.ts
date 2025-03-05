import { isToday, isBefore, addMinutes, format } from "date-fns";
import { hasEnoughConsecutiveTime } from "./consecutiveTimeChecker";
import { isWithinWorkingHours, isAfterMidnight } from "./workingHoursChecker";
import { convertTimeToMinutes, convertMinutesToTime } from "./timeConversion";
import { UnavailableSlot } from "./timeSlotTypes";

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
  
  console.log(`\n======= Checking availability for ${timeString} =======`);
  console.log(`Date: ${format(selectedDate, 'yyyy-MM-dd')}, Duration: ${serviceDuration} mins`);
  
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
      console.log(`❌ Slot ${timeString} is before minimum booking time`);
      return false;
    }
  }

  // Check if the slot end time extends beyond the working hours
  const slotEndMinutes = slotMinutes + serviceDuration;
  const slotEndTimeString = convertMinutesToTime(slotEndMinutes);
  const slotEndCrossesMidnight = slotEndMinutes >= 24 * 60;
  
  // Check if service duration would cross outside of working hours
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
      console.log(`❌ Slot ${timeString} would end at ${slotEndTimeString} which is outside working hours`);
      return false;
    }
  } else {
    // For non-midnight-crossing slots, check if end time is within working hours
    if (!isWithinWorkingHours(slotEndMinutes, workingHoursRanges)) {
      console.log(`❌ Slot ${timeString} would end at ${slotEndTimeString} which is outside working hours`);
      return false;
    }
  }
  
  // Now check unavailable slots
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

  // Check if there's enough consecutive time for the service
  if (!hasEnoughConsecutiveTime(slotMinutes, serviceDuration, unavailableSlots)) {
    console.log(`❌ Slot ${timeString} doesn't have enough consecutive time due to conflicts`);
    return false;
  }
  
  console.log(`✅ Slot ${timeString} is available!`);
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
