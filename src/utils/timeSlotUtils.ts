
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays } from "date-fns";

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface UnavailableSlot {
  start_time: number;
  end_time: number;
}

/**
 * Converts a time string (HH:MM) to minutes since midnight
 */
export const convertTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes since midnight to a time string (HH:MM)
 */
export const convertMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Checks if a time string represents a time after midnight (00:00-11:59)
 */
export const isAfterMidnight = (time: string): boolean => {
  const [hours] = time.split(':').map(Number);
  return hours >= 0 && hours < 12; // 00:00 to 11:59 are after midnight
};

/**
 * Checks if a time range crosses midnight
 */
export const doesCrossMidnight = (start: string, end: string): boolean => {
  const startMinutes = convertTimeToMinutes(start);
  const endMinutes = convertTimeToMinutes(end);
  
  // If end time is less than start time, it means the range crosses midnight
  return endMinutes < startMinutes;
};

/**
 * Checks if there's enough consecutive time for a service
 * Enhanced with better logging and validation of unavailable slots
 */
export const hasEnoughConsecutiveTime = (
  slotStartMinutes: number,
  serviceDuration: number,
  unavailableSlots: UnavailableSlot[]
): boolean => {
  // Validate inputs
  if (!Array.isArray(unavailableSlots)) {
    console.error("Invalid unavailableSlots:", unavailableSlots);
    return true; // Default to available if data is invalid
  }
  
  // Log the service duration for debugging
  const slotEndMinutes = slotStartMinutes + serviceDuration;
  const timeStart = convertMinutesToTime(slotStartMinutes);
  const timeEnd = convertMinutesToTime(slotEndMinutes);
  
  console.log(`Checking consecutive time from ${timeStart} to ${timeEnd} (${slotStartMinutes}-${slotEndMinutes} mins)`);
  console.log(`Number of unavailable slots: ${unavailableSlots.length}`);
  
  if (unavailableSlots.length === 0) {
    console.log("No unavailable slots, time is available");
    return true;
  }
  
  // Debug: log all unavailable slots
  unavailableSlots.forEach((slot, index) => {
    const unavailStart = convertMinutesToTime(slot.start_time);
    const unavailEnd = convertMinutesToTime(slot.end_time);
    console.log(`Unavailable slot ${index+1}: ${unavailStart}-${unavailEnd} (${slot.start_time}-${slot.end_time} mins)`);
  });

  // Check if any unavailable slot overlaps with our required duration
  for (const slot of unavailableSlots) {
    // Ensure slot times are numbers
    const slotStart = typeof slot.start_time === 'number' 
      ? slot.start_time 
      : convertTimeToMinutes(String(slot.start_time));
    
    const slotEnd = typeof slot.end_time === 'number' 
      ? slot.end_time 
      : convertTimeToMinutes(String(slot.end_time));
    
    if (isNaN(slotStart) || isNaN(slotEnd)) {
      console.error("Invalid slot times:", slot);
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
      // Check if ANY part of our slot is within the unavailable period
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
      const unavailStartTime = convertMinutesToTime(slotStart);
      const unavailEndTime = convertMinutesToTime(slotEnd);
      
      console.log(`OVERLAP DETECTED: Slot ${timeStart}-${timeEnd} overlaps with unavailable period ${unavailStartTime}-${unavailEndTime}`);
      console.log('Overlap details:', {
        requestedSlot: `${timeStart}-${timeEnd}`,
        serviceStart: slotStartMinutes,
        serviceEnd: slotEndMinutes,
        unavailableSlot: `${unavailStartTime}-${unavailEndTime}`,
        unavailableStart: slotStart,
        unavailableEnd: slotEnd,
        slotCrossesMidnight
      });
      return false;
    }
  }
  
  console.log(`No overlaps found. Slot ${timeStart}-${timeEnd} has enough consecutive time.`);
  return true;
};

/**
 * Custom sort function for time slots - ensures after-midnight slots come after regular slots
 */
export const sortTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  // First make a copy to avoid mutating the original array
  const slotsCopy = [...slots];
  
  return slotsCopy.sort((a, b) => {
    // Special handling to ensure after-midnight slots (00:00-11:59) come after regular slots
    const aIsAfterMidnight = isAfterMidnight(a.time);
    const bIsAfterMidnight = isAfterMidnight(b.time);
    
    // If one is after midnight and one isn't, the after-midnight slot comes later
    if (aIsAfterMidnight && !bIsAfterMidnight) return 1;
    if (!aIsAfterMidnight && bIsAfterMidnight) return -1;
    
    // Otherwise, sort by time in minutes
    const aMinutes = convertTimeToMinutes(a.time);
    const bMinutes = convertTimeToMinutes(b.time);
    return aMinutes - bMinutes;
  });
};

/**
 * Creates a unique cache key for employee-date combinations
 */
export const createTimeSlotsKey = (employeeId: string, date: Date): string => {
  return `timeSlots-${employeeId}-${format(date, 'yyyy-MM-dd')}`;
};

/**
 * Normalizes unavailable slots for consistent format
 */
export const normalizeUnavailableSlots = (slots: any[]): UnavailableSlot[] => {
  return slots.map(slot => ({
    start_time: typeof slot.start_time === 'number' 
      ? slot.start_time 
      : convertTimeToMinutes(slot.start_time as unknown as string),
    end_time: typeof slot.end_time === 'number' 
      ? slot.end_time 
      : convertTimeToMinutes(slot.end_time as unknown as string)
  }));
};

/**
 * Checks if a time slot is within the working hours ranges
 * Improved to properly handle ranges that cross midnight
 */
export const isWithinWorkingHours = (
  slotMinutes: number, 
  workingHoursRanges: string[]
): boolean => {
  // If no working hours specified, slot is not available
  if (!workingHoursRanges || workingHoursRanges.length === 0) {
    return false;
  }

  // Convert the slotMinutes to a formatted time string for logging
  const timeString = convertMinutesToTime(slotMinutes);
  const slotIsAfterMidnight = isAfterMidnight(timeString);
  
  console.log(`Checking if slot ${timeString} (${slotMinutes} mins) is within working hours. After midnight: ${slotIsAfterMidnight}`);

  for (const range of workingHoursRanges) {
    const [start, end] = range.split('-');
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);
    const crossesMidnight = doesCrossMidnight(start, end);
    
    console.log(`Checking range ${range}: start=${startMinutes}, end=${endMinutes}, crossesMidnight=${crossesMidnight}`);
    
    if (crossesMidnight) {
      // For shifts that cross midnight
      if (slotIsAfterMidnight) {
        // Slot is after midnight (00:00-11:59) - check if it's before the end time
        if (slotMinutes <= endMinutes) {
          console.log(`✅ Slot ${timeString} is within after-midnight portion of range ${range}`);
          return true;
        }
      } else {
        // Slot is before midnight (12:00-23:59) - check if it's after the start time
        if (slotMinutes >= startMinutes) {
          console.log(`✅ Slot ${timeString} is within before-midnight portion of range ${range}`);
          return true;
        }
      }
    } else {
      // For regular shifts that don't cross midnight
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        console.log(`✅ Slot ${timeString} is within regular shift range ${range}`);
        return true;
      }
    }
  }
  
  console.log(`❌ Slot ${timeString} is NOT within any working hours range`);
  return false;
};

/**
 * Determines if a time slot falls within a specific date's business hours
 * Takes into account both the time of day and the date
 */
export const isSlotWithinBusinessHours = (
  slotTime: string, 
  selectedDate: Date, 
  workingHoursRanges: string[]
): boolean => {
  const slotMinutes = convertTimeToMinutes(slotTime);
  return isWithinWorkingHours(slotMinutes, workingHoursRanges);
};
