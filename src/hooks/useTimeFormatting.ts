
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import type { ReactNode } from "react";

export const useTimeFormatting = () => {
  const formatTimeRange = (timeRange: string, isArabic: boolean): string => {
    const [start, end] = timeRange.split('-');
    
    const formatTime = (time: string): string => {
      const [hours, minutes] = time.trim().split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return minutes === '00' ? `${formattedHour} ${ampm}` : `${formattedHour}:${minutes} ${ampm}`;
    };

    const formatArabicTime = (time: string): string => {
      const [hours, minutes] = time.trim().split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'م' : 'ص';
      const formattedHour = hour % 12 || 12;
      const convertToArabic = (str: string): string => {
        return str.replace(/[0-9]/g, (d) => String.fromCharCode(1632 + parseInt(d)));
      };
      return minutes === '00' 
        ? `${convertToArabic(`${formattedHour}`)} ${period}`
        : `${convertToArabic(`${formattedHour}:${minutes}`)} ${period}`;
    };

    if (isArabic) {
      return `${formatArabicTime(start)} - ${formatArabicTime(end)}`;
    }
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getCurrentDayHours = (workingHours: any, isArabic: boolean): ReactNode => {
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
