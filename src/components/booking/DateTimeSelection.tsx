
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ar } from 'date-fns/locale';
import { DateTimeSelectionSkeleton } from "./DateTimeSelectionSkeleton";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for calendar data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DateTimeSelectionSkeleton />;
  }

  const today = startOfDay(new Date());
  const threeDays = [
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];

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
                variant="outline"
                onClick={() => onDateSelect(date)}
                className={cn(
                  "flex flex-col items-center justify-center h-20 p-2 border transition-all duration-200",
                  selectedDate?.toDateString() === date.toDateString() 
                    ? "bg-gradient-to-b from-[#f8f8f8] to-white border-[#C4A484] shadow-md transform scale-[1.02]" 
                    : "hover:border-[#C4A484] hover:bg-[#f8f8f8]/50",
                  isBefore(date, startOfDay(new Date())) && "opacity-50 cursor-not-allowed"
                )}
                disabled={isBefore(date, startOfDay(new Date()))}
              >
                <span className={cn(
                  "text-sm font-medium",
                  selectedDate?.toDateString() === date.toDateString() && "text-[#C4A484]"
                )}>
                  {formatDay(date)}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  selectedDate?.toDateString() === date.toDateString() && "text-[#C4A484]"
                )}>
                  {formatDate(date)}
                </span>
              </Button>
            ))}
          </div>
          <button
            onClick={() => setShowFullCalendar(true)}
            className="text-sm text-[#C4A484] hover:underline w-full text-center transition-colors duration-200"
          >
            {language === 'ar' ? 'المزيد من التواريخ' : 'More dates'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border mx-auto shadow-sm"
            disabled={(date) => isBefore(date, startOfDay(new Date()))}
            locale={language === 'ar' ? ar : undefined}
          />
          <button
            onClick={() => setShowFullCalendar(false)}
            className="text-sm text-[#C4A484] hover:underline w-full text-center transition-colors duration-200"
          >
            {language === 'ar' ? 'عرض أقل' : 'Show less'}
          </button>
        </div>
      )}
    </div>
  );
};
