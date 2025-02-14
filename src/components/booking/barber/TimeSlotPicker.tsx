
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock12 } from "lucide-react";

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

  const isAfterMidnight = (time: string) => {
    const [hours] = time.split(':').map(Number);
    return hours < 12 && hours >= 0; // 00:00 to 11:59
  };

  if (timeSlots.length === 0) {
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

  const needsSeparator = (currentTime: string, prevTime: string) => {
    return prevTime === "23:30" && currentTime === "00:00";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">
        {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
      </h3>
      <div className="w-full">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
          <div className="overflow-x-auto scrollbar-hide px-4 py-4">
            <div className="flex space-x-3 rtl:space-x-reverse">
              {displayedTimeSlots.map((slot, index) => {
                const showSeparator = index > 0 && needsSeparator(slot.time, displayedTimeSlots[index - 1].time);

                return (
                  <>
                    {showSeparator && (
                      <div className="flex items-center mx-2" key={`separator-${index}`}>
                        <Clock12 className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                    <div key={slot.time}>
                      <Button
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
                    </div>
                  </>
                );
              })}
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
