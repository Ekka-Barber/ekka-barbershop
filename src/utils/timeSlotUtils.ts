
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
 * Checks if a time range crosses midnight
 */
export const doesCrossMidnight = (start: string, end: string): boolean => {
  const startMinutes = convertTimeToMinutes(start);
  const endMinutes = convertTimeToMinutes(end);
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
 * Custom sort function for time slots
 */
export const sortTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  return slots.sort((a, b) => {
    const [aHours] = a.time.split(':').map(Number);
    const [bHours] = b.time.split(':').map(Number);
    
    // Custom sorting to handle after-midnight times
    const aValue = aHours < 12 ? aHours + 24 : aHours;
    const bValue = bHours < 12 ? bHours + 24 : bHours;
    
    return aValue - bValue;
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

  for (const range of workingHoursRanges) {
    const [start, end] = range.split('-');
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);
    
    // Handle shifts that cross midnight
    if (endMinutes < startMinutes) {
      // For slots before midnight
      if (slotMinutes >= startMinutes || slotMinutes < endMinutes) {
        return true;
      }
    } else {
      // For regular shifts
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        return true;
      }
    }
  }
  
  return false;
};
