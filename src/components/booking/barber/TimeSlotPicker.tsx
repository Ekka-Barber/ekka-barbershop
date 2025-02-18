
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock12 } from "lucide-react";
import { Employee, TimeSlot } from "@/types/booking";

interface TimeSlotPickerProps {
  selectedBarber: Employee;
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  availableTimeSlots: TimeSlot[];
  isLoading: boolean;
}

export const TimeSlotPicker = ({
  selectedBarber,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  availableTimeSlots,
  isLoading
}: TimeSlotPickerProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading time slots...'}
        </h3>
        <div className="w-full">
          <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
            <div className="overflow-x-auto scrollbar-hide px-4 py-4">
              <div className="flex space-x-3 rtl:space-x-reverse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">
        {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
      </h3>
      <div className="w-full">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
          <div className="overflow-x-auto scrollbar-hide px-4 py-4">
            <div className="flex space-x-3 rtl:space-x-reverse">
              {availableTimeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  onClick={() => slot.isAvailable && onTimeChange(slot.time)}
                  disabled={!slot.isAvailable}
                  className={cn(
                    "flex-shrink-0",
                    !slot.isAvailable && "bg-red-50 hover:bg-red-50 cursor-not-allowed text-gray-400 border-red-100"
                  )}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
