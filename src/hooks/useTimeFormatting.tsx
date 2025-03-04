
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

  const getAllDaysHours = (workingHours: WorkingHoursType, isArabic: boolean): FormattedHours[] => {
    if (!workingHours) return [];

    const days = {
      sunday: { en: 'Sun', ar: 'الأحد' },
      monday: { en: 'Mon', ar: 'الإثنين' },
      tuesday: { en: 'Tue', ar: 'الثلاثاء' },
      wednesday: { en: 'Wed', ar: 'الأربعاء' },
      thursday: { en: 'Thu', ar: 'الخميس' },
      friday: { en: 'Fri', ar: 'الجمعة' },
      saturday: { en: 'Sat', ar: 'السبت' }
    };

    const daysOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Check if all days have the same working hours
    let allDaysHaveSameHours = true;
    let firstDayWithHours = '';
    
    // Find the first day with hours to compare against
    for (const day of daysOrder) {
      if (workingHours[day] && workingHours[day].length > 0) {
        firstDayWithHours = day;
        break;
      }
    }
    
    if (firstDayWithHours) {
      const referenceHours = JSON.stringify(workingHours[firstDayWithHours]);
      
      // Compare all other days with hours to the reference day
      for (const day of daysOrder) {
        if (workingHours[day] && workingHours[day].length > 0) {
          if (JSON.stringify(workingHours[day]) !== referenceHours) {
            allDaysHaveSameHours = false;
            break;
          }
        }
      }
    }
    
    // If all days have the same hours, return a single entry for "Daily" or "All days"
    if (allDaysHaveSameHours && firstDayWithHours) {
      const timeRanges = workingHours[firstDayWithHours].map(range => 
        formatTimeRange(range, isArabic)
      ).join(', ');
      
      return [{
        label: isArabic ? 'يومياً' : 'Daily',
        hours: timeRanges
      }];
    }
    
    // Group days with same hours as before (if hours differ between days)
    const hoursGroups: { [hours: string]: string[] } = {};
    
    daysOrder.forEach(day => {
      if (!workingHours[day]) return;
      
      const timeRanges = workingHours[day].map(range => formatTimeRange(range, isArabic)).join(', ');
      if (!hoursGroups[timeRanges]) {
        hoursGroups[timeRanges] = [];
      }
      hoursGroups[timeRanges].push(day);
    });

    // Format groups into readable strings
    return Object.entries(hoursGroups).map(([hours, groupDays]) => {
      let label: string;
      if (groupDays.length === 1) {
        label = days[groupDays[0]][isArabic ? 'ar' : 'en'];
      } else {
        const first = days[groupDays[0]][isArabic ? 'ar' : 'en'];
        const last = days[groupDays[groupDays.length - 1]][isArabic ? 'ar' : 'en'];
        label = `${first} - ${last}`;
      }
      
      return {
        label,
        hours
      };
    });
  };

  return {
    formatTimeRange,
    getCurrentDayHours,
    getAllDaysHours
  };
};
