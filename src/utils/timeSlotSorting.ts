
import { TimeSlot } from "./timeSlotTypes";
import { isAfterMidnight, convertTimeToMinutes } from "./timeConversion";

/**
 * Custom sort function for time slots - ensures after-midnight slots come after regular slots
 * and available slots come before unavailable slots within each time period
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
    
    // If they're both in the same time period (both after midnight or both before midnight),
    // prioritize available slots over unavailable ones
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    
    // If both have the same availability, sort by time
    const aMinutes = convertTimeToMinutes(a.time);
    const bMinutes = convertTimeToMinutes(b.time);
    return aMinutes - bMinutes;
  });
};
