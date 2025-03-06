
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
  // Handle minutes that are greater than 24 hours
  const adjustedMinutes = minutes % (24 * 60);
  const hours = Math.floor(adjustedMinutes / 60);
  const mins = adjustedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Checks if a time string represents a time after midnight (00:00-11:59)
 * This is critical for determining slots that belong to the next day
 */
export const isAfterMidnight = (time: string): boolean => {
  // Special case: exactly midnight (00:00) is considered after midnight
  if (time === '00:00') return true;
  
  const [hours] = time.split(':').map(Number);
  // Times from 00:00 to 11:59 are considered "after midnight" (next day)
  return hours >= 0 && hours < 12;
};

/**
 * Checks if a time range crosses midnight
 */
export const doesCrossMidnight = (start: string, end: string): boolean => {
  // Special case for midnight (00:00) as the end time
  if (end === '00:00') return true;
  
  const startMinutes = convertTimeToMinutes(start);
  const endMinutes = convertTimeToMinutes(end);
  
  // If end time is less than start time, it means the range crosses midnight
  return endMinutes < startMinutes;
};
