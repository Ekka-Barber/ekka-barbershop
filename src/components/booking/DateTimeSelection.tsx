import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DateTimeSelectionProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  timeSlots: string[];
}

export const DateTimeSelection = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  timeSlots
}: DateTimeSelectionProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border mx-auto"
        disabled={(date) => date < new Date()}
      />
      
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            onClick={() => onTimeSelect(time)}
            className="text-sm"
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
};