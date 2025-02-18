import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  const { trackEnhancedDateTimeInteraction } = useTracking();

  useEffect(() => {
    const startTime = new Date();
    setViewStartTime(startTime);
    
    // Track initial calendar view
    trackEnhancedDateTimeInteraction({
      interaction_type: 'calendar_open',
      calendar_view_type: 'quick_select',
      device_type: 'desktop',
      session_id: 'temp',
      quick_select_usage: true,
      view_duration_seconds: 0,
      calendar_navigation_path: []
    });

    return () => {
      const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      trackEnhancedDateTimeInteraction({
        interaction_type: 'view_duration',
        calendar_view_type: showFullCalendar ? 'month' : 'quick_select',
        device_type: 'desktop',
        session_id: 'temp',
        view_duration_seconds: duration,
        calendar_navigation_path: navigationPath
      });
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    const daysInAdvance = date ? differenceInDays(date, new Date()) : 0;
    
    trackEnhancedDateTimeInteraction({
      interaction_type: 'date_select',
      selected_date: date?.toISOString(),
      calendar_view_type: showFullCalendar ? 'month' : 'quick_select',
      device_type: 'desktop',
      session_id: 'temp',
      days_in_advance: daysInAdvance,
      quick_select_usage: !showFullCalendar,
      calendar_navigation_path: navigationPath
    });
    
    onDateSelect(date);
  };

  const handleCalendarToggle = (show: boolean) => {
    const duration = Math.floor((new Date().getTime() - viewStartTime.getTime()) / 1000);
    
    trackEnhancedDateTimeInteraction({
      interaction_type: show ? 'calendar_open' : 'calendar_close',
      calendar_view_type: show ? 'month' : 'quick_select',
      device_type: 'desktop',
      session_id: 'temp',
      view_duration_seconds: duration,
      quick_select_usage: !show,
      calendar_navigation_path: navigationPath
    });
    
    setShowFullCalendar(show);
    setViewStartTime(new Date());
    setNavigationPath([...navigationPath, show ? 'full_calendar' : 'quick_select']);
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
