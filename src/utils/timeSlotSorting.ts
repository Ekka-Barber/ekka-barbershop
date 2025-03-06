
import { TimeSlot } from "./timeSlotTypes";
import { isAfterMidnight, convertTimeToMinutes } from "./timeConversion";

/**
 * Custom sort function for time slots - ensures after-midnight slots come after regular slots
 * but maintains chronological order within each group
 * Updated to ensure 00:00 (midnight) is always treated as after-midnight
 */
export const sortTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  console.log("🔄 Sorting time slots...");
  
  // First make a copy to avoid mutating the original array
  const slotsCopy = [...slots];
  
  return slotsCopy.sort((a, b) => {
    // Special handling to ensure after-midnight slots (00:00-11:59) come after regular slots
    const aIsAfterMidnight = isAfterMidnight(a.time);
    const bIsAfterMidnight = isAfterMidnight(b.time);
    
    // Log sorting decisions for debugging
    console.log(`Comparing slots: ${a.time} (AM: ${aIsAfterMidnight}) and ${b.time} (AM: ${bIsAfterMidnight})`);
    
    // Special case for midnight (00:00) - always treat as after-midnight
    if (a.time === '00:00') {
      console.log(`Slot ${a.time} is midnight - treating as after-midnight`);
      return bIsAfterMidnight && b.time !== '00:00' ? 1 : 1;
    }
    
    if (b.time === '00:00') {
      console.log(`Slot ${b.time} is midnight - treating as after-midnight`);
      return aIsAfterMidnight && a.time !== '00:00' ? -1 : -1;
    }
    
    // If one is after midnight and one isn't, the after-midnight slot comes later
    if (aIsAfterMidnight && !bIsAfterMidnight) return 1;
    if (!aIsAfterMidnight && bIsAfterMidnight) return -1;
    
    // If both slots are in the same time period (both before or both after midnight),
    // sort them chronologically by time
    const aMinutes = convertTimeToMinutes(a.time);
    const bMinutes = convertTimeToMinutes(b.time);
    return aMinutes - bMinutes;
  });
};
