
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
 */
export const hasEnoughConsecutiveTime = (
  slotStartMinutes: number,
  serviceDuration: number,
  unavailableSlots: UnavailableSlot[]
): boolean => {
  const slotEndMinutes = slotStartMinutes + serviceDuration;

  // Check if any unavailable slot overlaps with our required duration
  for (const slot of unavailableSlots) {
    const slotStart = typeof slot.start_time === 'number' 
      ? slot.start_time 
      : convertTimeToMinutes(slot.start_time as unknown as string);
    
    const slotEnd = typeof slot.end_time === 'number' 
      ? slot.end_time 
      : convertTimeToMinutes(slot.end_time as unknown as string);

    // Check for any overlap
    if (
      (slotStartMinutes < slotEnd && slotEndMinutes > slotStart) || // Overlaps with unavailable period
      (slotStartMinutes === slotStart && slotEndMinutes === slotEnd) // Exactly matches unavailable period
    ) {
      console.log('Not enough consecutive time due to overlap:', {
        serviceStart: slotStartMinutes,
        serviceEnd: slotEndMinutes,
        unavailableStart: slotStart,
        unavailableEnd: slotEnd
      });
      return false;
    }
  }
  
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
 */
export const isWithinWorkingHours = (
  slotMinutes: number, 
  workingHoursRanges: string[]
): boolean => {
  // If no working hours specified, slot is not available
  if (!workingHoursRanges || workingHoursRanges.length === 0) {
    return false;
  }

  // First convert the slotMinutes to a formatted time string for easier comparison
  const slotHours = Math.floor(slotMinutes / 60);
  const slotMins = slotMinutes % 60;
  const timeString = `${slotHours.toString().padStart(2, '0')}:${slotMins.toString().padStart(2, '0')}`;
  const slotIsAfterMidnight = isAfterMidnight(timeString);
  
  console.log(`Checking if slot ${timeString} (${slotMinutes} mins) is within working hours. After midnight: ${slotIsAfterMidnight}`);

  for (const range of workingHoursRanges) {
    const [start, end] = range.split('-');
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);
    const crossesMidnight = doesCrossMidnight(start, end);
    
    console.log(`Checking range ${range}: start=${startMinutes}, end=${endMinutes}, crossesMidnight=${crossesMidnight}`);
    
    if (crossesMidnight) {
      // For shifts that cross midnight we need special handling
      if (slotIsAfterMidnight) {
        // If slot is after midnight (e.g., 01:30), check if it's before the end time
        if (slotMinutes < endMinutes) {
          console.log(`✅ Slot ${timeString} is within after-midnight portion of range ${range}`);
          return true;
        }
      } else {
        // If slot is before midnight (e.g., 22:30), check if it's after start time
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
