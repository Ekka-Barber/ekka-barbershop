import { TimeSlot } from "./timeSlotTypes";
import { isAfterMidnight, convertTimeToMinutes } from "./timeConversion";

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
