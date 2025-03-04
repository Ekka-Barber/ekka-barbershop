
import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock12 } from "lucide-react";
import { formatTime } from "@/utils/timeFormatting";
import { TimeSlot, isAfterMidnight } from "@/utils/timeSlotUtils";

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  showAllSlots: boolean;
  onToggleShowAll: () => void;
  isLoading?: boolean;
}

export const TimeSlotPicker = memo(({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots,
  onToggleShowAll,
  isLoading = false
}: TimeSlotPickerProps) => {
  const { language } = useLanguage();
  
  // Log available time slots for debugging
  console.log("Available time slots:", timeSlots.map(slot => slot.time));
  
  // Check if there are any after-midnight slots
  const hasAfterMidnightSlots = useMemo(() => {
    return timeSlots.some(slot => isAfterMidnight(slot.time));
  }, [timeSlots]);
  
  console.log("Has after-midnight slots:", hasAfterMidnightSlots);
  
  // All slots are available, so we just need to decide how many to show
  const displayedTimeSlots = showAllSlots ? timeSlots : timeSlots.slice(0, 6);
  
  // Determine if we need a separator between days
  const needsSeparator = (currentTime: string, prevTime: string) => {
    // If this is an after-midnight slot and the previous one wasn't
    return isAfterMidnight(currentTime) && prevTime && !isAfterMidnight(prevTime);
  };

  // Show loading state when loading
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
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 w-20" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message when no available slots
  if (timeSlots.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available time slots'}
        </h3>
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
          <div className="overflow-x-auto scrollbar-hide px-4 py-4 bg-white">
            <div className="flex flex-wrap gap-3">
              {displayedTimeSlots.map((slot, index) => {
                const prevTime = index > 0 ? displayedTimeSlots[index - 1].time : '';
                const showSeparator = needsSeparator(slot.time, prevTime);
                
                console.log(`Slot ${slot.time} - isAfterMidnight: ${isAfterMidnight(slot.time)}, showSeparator: ${showSeparator}`);
                
                return (
                  <React.Fragment key={slot.time}>
                    {showSeparator && (
                      <div className="flex items-center w-full justify-center my-2">
                        <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                        <Clock12 className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500 mx-2">
                          {language === 'ar' ? 'بعد منتصف الليل' : 'After midnight'}
                        </span>
                        <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => onTimeSelect(slot.time)}
                      className={cn(
                        "flex-shrink-0 transition-all duration-150 hover:bg-transparent",
                        selectedTime === slot.time 
                          ? "bg-[#FDF9EF] border-[#e7bd71] text-black hover:bg-[#FDF9EF]" 
                          : "border-border bg-background hover:bg-background"
                      )}
                    >
                      {formatTime(slot.time, language === 'ar')}
                    </Button>
                  </React.Fragment>
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
            ? language === 'ar' ? 'عرض أقل' : 'Show Less' 
            : language === 'ar' ? 'للمزيد' : 'Show More'}
        </Button>
      )}
    </div>
  );
});

TimeSlotPicker.displayName = "TimeSlotPicker";
