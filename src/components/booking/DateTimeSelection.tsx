
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ar } from 'date-fns/locale';
import { DateTimeSelectionSkeleton } from "./DateTimeSelectionSkeleton";
import { useBlockedDates } from "@/hooks/useBlockedDates";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { isBlocked, blockedDates } = useBlockedDates();

  useEffect(() => {
    // Simulate loading state for calendar data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If current selected date is blocked, unselect it
    if (selectedDate && isBlocked(selectedDate)) {
      onDateSelect(undefined);
    }
  }, [selectedDate, isBlocked, onDateSelect, blockedDates]);

  if (isLoading) {
    return <DateTimeSelectionSkeleton />;
  }

  const today = startOfDay(new Date());
  const threeDays = [
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];

  // Filter out blocked dates from the three days
  const availableDays = threeDays.filter(date => !isBlocked(date));

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
    <div className="space-y-6 relative z-20">
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
                  (isBefore(date, startOfDay(new Date())) || isBlocked(date)) && 
                    "opacity-50 cursor-not-allowed bg-gray-100"
                )}
                disabled={isBefore(date, startOfDay(new Date())) || isBlocked(date)}
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
                {isBlocked(date) && (
                  <span className="text-xs text-red-500 mt-1">
                    {language === 'ar' ? 'محجوز' : 'Unavailable'}
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {availableDays.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {language === 'ar' 
                  ? 'جميع الأيام الثلاثة القادمة غير متاحة للحجز.' 
                  : 'All three upcoming days are unavailable for booking.'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="pt-2 relative z-30">
            <button
              onClick={() => setShowFullCalendar(true)}
              className="text-sm text-[#C4A484] hover:underline w-full text-center transition-colors duration-200 py-2"
            >
              {language === 'ar' ? 'المزيد من التواريخ' : 'More dates'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border mx-auto shadow-sm"
            disabled={(date) => isBefore(date, startOfDay(new Date())) || isBlocked(date)}
            locale={language === 'ar' ? ar : undefined}
            modifiers={{
              blocked: (date) => isBlocked(date)
            }}
            modifiersStyles={{
              blocked: {
                backgroundColor: "rgb(254 226 226)",
                color: "rgb(185 28 28)",
                textDecoration: "line-through",
                opacity: 0.8
              }
            }}
          />
          <button
            onClick={() => setShowFullCalendar(false)}
            className="text-sm text-[#C4A484] hover:underline w-full text-center transition-colors duration-200 py-2"
          >
            {language === 'ar' ? 'عرض أقل' : 'Show less'}
          </button>
        </div>
      )}
    </div>
  );
};
