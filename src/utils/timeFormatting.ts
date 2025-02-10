
export const formatTime = (time: string, isArabic: boolean): string => {
  const [hours, minutes] = time.trim().split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
  const formattedHour = hour % 12 || 12;

  if (isArabic) {
    const { convertToArabic } = require('./arabicNumerals');
    return minutes === '00'
      ? `${convertToArabic(formattedHour.toString())} ${period}`
      : `${convertToArabic(`${formattedHour}:${minutes}`)} ${period}`;
  }

  return minutes === '00'
    ? `${formattedHour} ${period}`
    : `${formattedHour}:${minutes} ${period}`;
};

export const formatTimeRange = (timeRange: string, isArabic: boolean): string => {
  const [start, end] = timeRange.split('-');
  return `${formatTime(start, isArabic)} - ${formatTime(end, isArabic)}`;
};
