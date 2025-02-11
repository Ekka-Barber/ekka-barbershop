
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeSlot } from "@/hooks/useTimeSlots";

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  showAllSlots: boolean;
  onToggleShowAll: () => void;
  isLoading?: boolean;
}

export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots,
  onToggleShowAll,
  isLoading = false
}: TimeSlotPickerProps) => {
  const { language } = useLanguage();
  const displayedTimeSlots = showAllSlots ? timeSlots : timeSlots.slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading time slots...'}
        </h3>
        <div className="w-screen -mx-4 md:-mx-8">
          <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-b border-gray-100">
            <div className="overflow-x-auto hide-scrollbar px-6 py-4">
              <div className="flex space-x-3 rtl:space-x-reverse">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center text-gray-500">
        {language === 'ar' 
          ? 'لا توجد مواعيد متاحة في هذا اليوم' 
          : 'No available time slots for this day'}
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
                  className={`flex-shrink-0 ${
                    slot.isAvailable 
                      ? 'bg-[#F2FCE2] hover:bg-[#E2ECd2]' 
                      : 'bg-[#FFDEE2] cursor-not-allowed'
                  } ${selectedTime === slot.time ? '!bg-primary text-primary-foreground' : ''}`}
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
