
import { convertTimeToMinutes, isAfterMidnight, doesCrossMidnight, convertMinutesToTime } from "./timeConversion";

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

  // Convert the slotMinutes to a formatted time string for logging
  const timeString = convertMinutesToTime(slotMinutes);
  const slotIsAfterMidnight = isAfterMidnight(timeString);
  
  for (const range of workingHoursRanges) {
    const [start, end] = range.split('-');
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);
    const crossesMidnight = doesCrossMidnight(start, end);
    
    // Special handling for 00:00 (midnight) when it's the end time
    if (end === '00:00' && timeString === '00:00') {
      return true;
    }
    
    if (crossesMidnight) {
      // For shifts that cross midnight
      if (slotIsAfterMidnight) {
        // Slot is after midnight (00:00-11:59) - check if it's before the end time
        if (slotMinutes <= endMinutes) {
          return true;
        }
      } else {
        // Slot is before midnight (12:00-23:59)
        // Check if it's at or after the start time AND before midnight
        if (slotMinutes >= startMinutes && slotMinutes < 24 * 60) {
          return true;
        }
      }
    } else {
      // For regular shifts that don't cross midnight
      // Include exact end time in the valid range
      if (slotMinutes >= startMinutes && slotMinutes <= endMinutes) {
        return true;
      }
    }
  }
  
  return false;
};
