import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { ar } from 'date-fns/locale';
import { useTracking } from "@/hooks/useTracking";

interface DateTimeSelectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateTimeSelection = ({
  selectedDate,
  onDateSelect,
}: DateTimeSelectionProps) => {
  const { t, language } = useLanguage();
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarViewDuration, setCalendarViewDuration] = useState<number>(0);
  const [viewStartTime, setViewStartTime] = useState<Date>(new Date());
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const { trackDateTimeInteraction } = useTracking();

  const threeDays = useMemo(() => [
    new Date(),
    addDays(new Date(), 1),
    addDays(new Date(), 2)
  ], []);

  useEffect(() => {
    const startTime = new Date();
    setViewStartTime(startTime);
    
    trackDateTimeInteraction({
      event_name: 'calendar_opened',
      interaction_type: 'calendar_open',
      calendar_view_type: 'quick_select',
      quick_select_usage: true,
      view_duration_seconds: 0,
      calendar_navigation_path: []
    });

    return () => {
      const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      trackDateTimeInteraction({
        event_name: 'calendar_closed',
        interaction_type: 'calendar_close',
        calendar_view_type: showFullCalendar ? 'month' : 'quick_select',
        view_duration_seconds: duration,
        calendar_navigation_path: navigationPath,
        quick_select_usage: !showFullCalendar,
        preferred_time_slots: {
          morning: 0,
          afternoon: 0,
          evening: 0
        }
      });
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    const daysInAdvance = date ? differenceInDays(date, new Date()) : 0;
    
    trackDateTimeInteraction({
      event_name: 'date_selected',
      interaction_type: 'date_select',
      calendar_view_type: showFullCalendar ? 'month' : 'quick_select',
      selected_date: date?.toISOString(),
      days_in_advance: daysInAdvance,
      quick_select_usage: !showFullCalendar,
      calendar_navigation_path: navigationPath,
      preferred_time_slots: {
        morning: date && isTimeInRange(date, 6, 12) ? 1 : 0,
        afternoon: date && isTimeInRange(date, 12, 17) ? 1 : 0,
        evening: date && isTimeInRange(date, 17, 23) ? 1 : 0
      }
    });
    
    onDateSelect(date);
  };

  const handleCalendarToggle = (show: boolean) => {
    const duration = Math.floor((new Date().getTime() - viewStartTime.getTime()) / 1000);
    
    trackDateTimeInteraction({
      event_name: show ? 'calendar_expanded' : 'calendar_collapsed',
      interaction_type: show ? 'calendar_open' : 'calendar_close',
      calendar_view_type: show ? 'month' : 'quick_select',
      view_duration_seconds: duration,
      calendar_navigation_path: navigationPath,
      quick_select_usage: !show,
      preferred_time_slots: {
        morning: 0,
        afternoon: 0,
        evening: 0
      }
    });
    
    setShowFullCalendar(show);
    setViewStartTime(new Date());
    setNavigationPath([...navigationPath, show ? 'full_calendar' : 'quick_select']);
  };

  const isTimeInRange = (date: Date, startHour: number, endHour: number): boolean => {
    const hour = date.getHours();
    return hour >= startHour && hour < endHour;
  };

  const formatDate = (date: Date) => {
    return language === 'ar' 
      ? format(date, 'dd/MM')
      : format(date, 'MMM dd');
  };

  const formatDay = (date: Date) => {
    return language === 'ar'
      ? format(date, 'EEEE', { locale: ar })
      : format(date, 'EEE');
  };

  return (
    <div className="space-y-6">
      {!showFullCalendar ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {threeDays.map((date) => (
              <Button
                key={date.toISOString()}
                variant={selectedDate?.toDateString() === date.toDateString() ? "default" : "outline"}
                onClick={() => handleDateSelect(date)}
                className={cn(
                  "flex flex-col items-center justify-center h-20 p-2",
                  isBefore(date, startOfDay(new Date())) && "opacity-50 cursor-not-allowed"
                )}
                disabled={isBefore(date, startOfDay(new Date()))}
              >
                <span className="text-sm font-medium">
                  {formatDay(date)}
                </span>
                <span className="text-lg font-bold">{formatDate(date)}</span>
              </Button>
            ))}
          </div>
          <button
            onClick={() => handleCalendarToggle(true)}
            className="text-sm text-primary hover:underline w-full text-center"
          >
            {language === 'ar' ? 'المزيد من التواريخ' : 'More dates'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border mx-auto"
            disabled={(date) => isBefore(date, startOfDay(new Date()))}
            locale={language === 'ar' ? ar : undefined}
          />
          <button
            onClick={() => handleCalendarToggle(false)}
            className="text-sm text-primary hover:underline w-full text-center"
          >
            {language === 'ar' ? 'عرض أقل' : 'Show less'}
          </button>
        </div>
      )}
    </div>
  );
};
