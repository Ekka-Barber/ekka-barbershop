
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay } from "date-fns";
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
  const { trackDateTimeInteraction } = useTracking();

  // Get current date and next two days
  const today = startOfDay(new Date());
  const threeDays = [
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];

  useEffect(() => {
    // Track initial calendar view
    trackDateTimeInteraction({
      interaction_type: 'calendar_open',
      calendar_view_type: 'quick_select',
      device_type: 'desktop', // This will be mapped correctly by the tracking service
      session_id: 'temp', // This will be replaced by the tracking service
    });
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    trackDateTimeInteraction({
      interaction_type: 'date_select',
      selected_date: date,
      calendar_view_type: showFullCalendar ? 'month' : 'quick_select',
      device_type: 'desktop', // This will be mapped correctly by the tracking service
      session_id: 'temp', // This will be replaced by the tracking service
    });
    onDateSelect(date);
  };

  const handleCalendarToggle = (show: boolean) => {
    trackDateTimeInteraction({
      interaction_type: show ? 'calendar_open' : 'calendar_close',
      calendar_view_type: show ? 'month' : 'quick_select',
      device_type: 'desktop', // This will be mapped correctly by the tracking service
      session_id: 'temp', // This will be replaced by the tracking service
    });
    setShowFullCalendar(show);
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
