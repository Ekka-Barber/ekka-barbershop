
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, parse, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export interface WorkingHours {
  [key: string]: string[];
}

interface DateTimeSelectionProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  employeeWorkingHours?: WorkingHours | null;
}

export const DateTimeSelection = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  employeeWorkingHours
}: DateTimeSelectionProps) => {
  const { t, language } = useLanguage();
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // Get current date and next two days
  const today = startOfDay(new Date());
  const threeDays = [
    today,
    addDays(today, 1),
    addDays(today, 2)
  ];

  const cutoffTime = addDays(new Date(), 1);

  const getDayName = (date: Date): string => {
    return format(date, 'EEEE').toLowerCase();
  };

  const generateTimeSlots = (workingHoursRanges: string[] = []) => {
    const slots: string[] = [];
    
    workingHoursRanges.forEach(range => {
      const [start, end] = range.split('-');
      const startTime = parse(start, 'HH:mm', new Date());
      let endTime = parse(end, 'HH:mm', new Date());
      
      if (end === "00:00" || end === "01:00") {
        endTime = addDays(endTime, 1);
      }
      
      let currentSlot = startTime;
      while (isBefore(currentSlot, endTime)) {
        slots.push(format(currentSlot, 'HH:mm'));
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
      }
    });

    return slots.sort();
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayName = getDayName(selectedDate);
    const workingHours = employeeWorkingHours?.[dayName] || [];
    return generateTimeSlots(workingHours);
  }, [selectedDate, employeeWorkingHours]);

  const isTimeSlotDisabled = (time: string): boolean => {
    if (!selectedDate) return true;

    const slotDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(time.split(':')[0]),
      parseInt(time.split(':')[1])
    );

    return isBefore(slotDateTime, cutoffTime);
  };

  useEffect(() => {
    if (selectedTime && isTimeSlotDisabled(selectedTime)) {
      onTimeSelect('');
    }
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return language === 'ar' 
      ? format(date, 'dd/MM')
      : format(date, 'MMM dd');
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
                onClick={() => onDateSelect(date)}
                className={cn(
                  "flex flex-col items-center justify-center h-20 p-2",
                  isBefore(date, startOfDay(new Date())) && "opacity-50 cursor-not-allowed"
                )}
                disabled={isBefore(date, startOfDay(new Date()))}
              >
                <span className="text-sm font-medium">
                  {language === 'ar' ? format(date, 'EEEE') : format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold">{formatDate(date)}</span>
              </Button>
            ))}
          </div>
          <button
            onClick={() => setShowFullCalendar(true)}
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
            onSelect={onDateSelect}
            className="rounded-md border mx-auto"
            disabled={(date) => isBefore(date, startOfDay(new Date()))}
          />
          <button
            onClick={() => setShowFullCalendar(false)}
            className="text-sm text-primary hover:underline w-full text-center"
          >
            {language === 'ar' ? 'عرض أقل' : 'Show less'}
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2">
        {availableTimeSlots.map((time) => {
          const isDisabled = isTimeSlotDisabled(time);
          return (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              onClick={() => !isDisabled && onTimeSelect(time)}
              disabled={isDisabled}
              className={cn(
                "text-sm relative",
                isDisabled && "cursor-not-allowed",
                isDisabled && "after:content-[''] after:absolute after:left-0 after:right-0 after:top-1/2 after:h-[1px] after:bg-gray-300 after:rotate-45"
              )}
            >
              {time}
            </Button>
          )}
        )}
      </div>
    </div>
  );
};
