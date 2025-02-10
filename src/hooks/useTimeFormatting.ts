
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import type { ReactNode } from "react";

type WorkingHoursType = {
  [key: string]: string[];
} | null;

interface ArabicNumerals {
  [key: string]: string;
}

const arabicNumerals: ArabicNumerals = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩'
};

export const useTimeFormatting = () => {
  const convertToArabic = (str: string): string => {
    return str.replace(/[0-9]/g, (digit) => arabicNumerals[digit] || digit);
  };

  const formatTime = (time: string, isArabic: boolean): string => {
    const [hours, minutes] = time.trim().split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    const formattedHour = hour % 12 || 12;

    if (isArabic) {
      return minutes === '00'
        ? `${convertToArabic(formattedHour.toString())} ${period}`
        : `${convertToArabic(`${formattedHour}:${minutes}`)} ${period}`;
    }

    return minutes === '00'
      ? `${formattedHour} ${period}`
      : `${formattedHour}:${minutes} ${period}`;
  };

  const formatTimeRange = (timeRange: string, isArabic: boolean): string => {
    const [start, end] = timeRange.split('-');
    return `${formatTime(start, isArabic)} - ${formatTime(end, isArabic)}`;
  };

  const getCurrentDayHours = (workingHours: WorkingHoursType, isArabic: boolean): ReactNode => {
    if (!workingHours) return null;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    const currentDay = days[dayIndex];
    
    const hours = transformWorkingHours(workingHours);
    if (!hours || !hours[currentDay] || !hours[currentDay].length) return null;

    const timeRanges = hours[currentDay].map(range => formatTimeRange(range, isArabic));
    
    if (isArabic) {
      return (
        <>
          <div>ساعات العمل اليوم</div>
          <div>{timeRanges.join(' , ')}</div>
        </>
      );
    }
    return (
      <>
        <div>Today's hours</div>
        <div>{timeRanges.join(', ')}</div>
      </>
    );
  };

  return {
    formatTimeRange,
    getCurrentDayHours
  };
};
