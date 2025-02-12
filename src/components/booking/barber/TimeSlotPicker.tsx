
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  showAllSlots: boolean;
  onToggleShowAll: () => void;
}

export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots,
  onToggleShowAll
}: TimeSlotPickerProps) => {
  const { language } = useLanguage();
  const displayedTimeSlots = showAllSlots ? timeSlots : timeSlots.slice(0, 6);

  if (timeSlots.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading time slots...'}
        </h3>
        <div className="w-screen -mx-4 md:-mx-8">
          <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-b border-gray-100">
            <div className="overflow-x-auto hide-scrollbar px-6 py-4">
              <div className="flex space-x-3 rtl:space-x-reverse min-w-full">
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
      <div className="w-screen -mx-4 md:-mx-8">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-b border-gray-100">
          <div className="overflow-x-auto hide-scrollbar px-6 py-4">
            <div className="flex space-x-3 rtl:space-x-reverse min-w-full">
              {displayedTimeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  onClick={() => slot.isAvailable && onTimeSelect(slot.time)}
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
      
      {timeSlots.length > 6 && (
        <Button
          variant="ghost"
          onClick={onToggleShowAll}
          className="w-full mt-2"
        >
          {showAllSlots 
            ? (language === 'ar' ? 'عرض أقل' : 'Show Less')
            : (language === 'ar' ? 'للمزيد' : 'Show More')}
        </Button>
      )}
    </div>
  );
};
