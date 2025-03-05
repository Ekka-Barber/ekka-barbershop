
import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock12 } from "lucide-react";
import { formatTime } from "@/utils/timeFormatting";
import { TimeSlot } from "@/utils/timeSlotTypes";
import { isAfterMidnight } from "@/utils/timeConversion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Only show available time slots (past slots will already be filtered out in BarberSelection.tsx)
  const availableTimeSlots = useMemo(() => {
    return timeSlots.filter(slot => slot.isAvailable);
  }, [timeSlots]);
  
  // Check if there are any after-midnight slots
  const hasAfterMidnightSlots = useMemo(() => {
    return availableTimeSlots.some(slot => isAfterMidnight(slot.time));
  }, [availableTimeSlots]);
  
  // Group slots by time period (before/after midnight)
  const groupedSlots = useMemo(() => {
    return {
      regular: availableTimeSlots.filter(slot => !isAfterMidnight(slot.time)),
      afterMidnight: availableTimeSlots.filter(slot => isAfterMidnight(slot.time))
    };
  }, [availableTimeSlots]);
  
  // Show all slots or just first 6
  const displayedTimeSlots = showAllSlots ? availableTimeSlots : availableTimeSlots.slice(0, 6);
  
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
  if (availableTimeSlots.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available time slots'}
        </h3>
      </div>
    );
  }

  // Render time slot button
  const renderTimeSlotButton = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;
    
    return (
      <Button
        key={slot.time}
        variant="outline"
        onClick={() => onTimeSelect(slot.time)}
        className={cn(
          "flex-shrink-0 transition-all duration-150 hover:bg-transparent",
          isSelected 
            ? "bg-[#FDF9EF] border-[#e7bd71] text-black hover:bg-[#FDF9EF]" 
            : "border-border bg-background hover:bg-background"
        )}
      >
        {formatTime(slot.time, language === 'ar')}
      </Button>
    );
  };

  // Render time slots with better separation for after-midnight slots
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">
        {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
      </h3>
      <div className="w-full">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
          <div className="overflow-x-auto scrollbar-hide px-4 py-4 bg-white">
            {/* Regular time slots (before midnight) */}
            {groupedSlots.regular.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {displayedTimeSlots
                  .filter(slot => !isAfterMidnight(slot.time))
                  .map(slot => renderTimeSlotButton(slot))}
              </div>
            )}
              
            {/* After midnight separator and slots */}
            {hasAfterMidnightSlots && groupedSlots.afterMidnight.length > 0 && (
              <>
                <div className="flex items-center w-full justify-center my-3">
                  <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                  <Clock12 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 mx-2">
                    {language === 'ar' ? 'بعد منتصف الليل' : 'After midnight'}
                  </span>
                  <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {displayedTimeSlots
                    .filter(slot => isAfterMidnight(slot.time))
                    .map(slot => renderTimeSlotButton(slot))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {availableTimeSlots.length > 6 && (
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
