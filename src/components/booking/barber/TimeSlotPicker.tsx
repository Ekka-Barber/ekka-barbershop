
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeSlotPickerProps {
  timeSlots: string[];
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
              {displayedTimeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => onTimeSelect(time)}
                  className="flex-shrink-0"
                >
                  {time}
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

