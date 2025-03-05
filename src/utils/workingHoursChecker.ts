import { convertTimeToMinutes, convertMinutesToTime, isAfterMidnight, doesCrossMidnight } from "./timeConversion";

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
