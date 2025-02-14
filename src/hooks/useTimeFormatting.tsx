
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
    if (!hours || !hours[currentDay]) return null;

    // Check if the current day has any time ranges
    const currentDayHours = hours[currentDay];
    if (!Array.isArray(currentDayHours) || currentDayHours.length === 0) return null;

    const timeRanges = currentDayHours.map(range => formatTimeRange(range, isArabic));
    
    return <WorkingHoursDisplay isArabic={isArabic} timeRanges={timeRanges} />;
  };

  return {
    formatTimeRange,
    getCurrentDayHours
  };
};
