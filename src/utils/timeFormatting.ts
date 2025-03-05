import { convertToArabic } from './arabicNumerals';

export const formatTime = (time: string, isArabic: boolean): string => {
  const [hours, minutes] = time.trim().split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
  const formattedHour = hour % 12 || 12;

  // Make Arabic display more compact - always use hour only format
  if (isArabic) {
    // For Arabic, always use hour-only format with period
    return `${convertToArabic(formattedHour.toString())}${period}`;
  }

  // For English, keep the existing format with minutes if they're not '00'
  return minutes === '00'
    ? `${formattedHour}${period}`
    : `${formattedHour}:${minutes}${period}`;
};

export const formatTimeRange = (timeRange: string, isArabic: boolean): string => {
  const [start, end] = timeRange.split('-');
  return `${formatTime(start, isArabic)}-${formatTime(end, isArabic)}`;
};
