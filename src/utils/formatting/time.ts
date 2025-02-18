
export const formatDuration = (duration: number, language: string) => {
  return `${duration} ${getTimeUnit(duration, language)}`;
};

export const getTimeUnit = (duration: number, language: string) => {
  if (language === 'ar') {
    return duration >= 5 && duration <= 10 ? 'دقائق' : 'دقيقة';
  }
  return 'min';
};

export const formatTime = (time: string, isArabic: boolean): string => {
  const [hours, minutes] = time.trim().split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
  const formattedHour = hour % 12 || 12;

  return minutes === '00'
    ? `${formattedHour} ${period}`
    : `${formattedHour}:${minutes} ${period}`;
};
