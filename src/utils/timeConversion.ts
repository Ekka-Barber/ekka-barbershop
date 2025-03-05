
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
