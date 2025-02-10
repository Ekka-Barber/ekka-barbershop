
import { type ReactNode } from "react";
import { formatTimeRange } from "@/utils/timeFormatting";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { WorkingHoursDisplay } from "@/components/working-hours/WorkingHoursDisplay";

type WorkingHoursType = {
  [key: string]: string[];
} | null;

interface FormattedHours {
  label: string;
  hours: string;
}

export const useTimeFormatting = () => {
  const getCurrentDayHours = (workingHours: WorkingHoursType, isArabic: boolean): ReactNode => {
    if (!workingHours) return null;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    const currentDay = days[dayIndex];
    
    const hours = transformWorkingHours(workingHours);
    if (!hours || !hours[currentDay] || !hours[currentDay].length) return null;

    const timeRanges = hours[currentDay].map(range => formatTimeRange(range, isArabic));
    
    return <WorkingHoursDisplay isArabic={isArabic} timeRanges={timeRanges} />;
  };

  return {
    formatTimeRange,
    getCurrentDayHours
  };
};
