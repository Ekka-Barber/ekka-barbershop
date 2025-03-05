
import { type ReactNode } from "react";
import { formatTimeRange } from "@/utils/timeFormatting";
import { transformWorkingHours, formatWorkingHoursForDisplay } from "@/utils/workingHoursUtils";
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

    // Use the WorkingHoursDisplay component which will handle the formatting
    return <WorkingHoursDisplay isArabic={isArabic} workingHours={workingHours} />;
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
      ).join(isArabic ? ' ، ' : ', ');
      
      return [{
        label: isArabic ? 'يومياً' : 'Daily',
        hours: timeRanges
      }];
    }
    
    // Group days with same hours
    const hoursGroups: { [hours: string]: string[] } = {};
    
    daysOrder.forEach(day => {
      if (!workingHours[day]) return;
      
      const timeRanges = workingHours[day].map(range => formatTimeRange(range, isArabic)).join(isArabic ? ' ، ' : ', ');
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
