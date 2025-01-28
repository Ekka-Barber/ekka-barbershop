import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addHours, isBefore, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

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
  const { t } = useLanguage();

  // Get current date and time
  const now = new Date();
  const cutoffTime = addHours(now, 1);

  const getDayName = (date: Date): string => {
    return format(date, 'EEEE').toLowerCase();
  };

  const generateTimeSlots = (workingHoursRanges: string[] = []) => {
    const slots: string[] = [];
    
    workingHoursRanges.forEach(range => {
      const [start, end] = range.split('-');
      const startTime = parse(start, 'HH:mm', new Date());
      let endTime = parse(end, 'HH:mm', new Date());
      
      // If end time is "00:00", set it to midnight of the next day
      if (end === "00:00") {
        endTime = addHours(endTime, 24);
      }
      // If end time is "01:00", set it to 1 AM of the next day
      else if (end === "01:00") {
        endTime = addHours(endTime, 24);
      }
      
      let currentSlot = startTime;
      while (isBefore(currentSlot, endTime)) {
        slots.push(format(currentSlot, 'HH:mm'));
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000); // Add 30 minutes
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

  // Reset time selection when date changes
  useEffect(() => {
    if (selectedTime && isTimeSlotDisabled(selectedTime)) {
      onTimeSelect('');
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border mx-auto"
        disabled={(date) => isBefore(date, new Date().setHours(0, 0, 0, 0))}
      />
      
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