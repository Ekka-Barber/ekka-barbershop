
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
  const { language, t } = useLanguage();
  
  // Split slots into before and after midnight for display purposes
  const { beforeMidnightSlots, afterMidnightSlots, hasAfterMidnightSlots } = useMemo(() => {
    // Filter slots into before and after midnight
    const beforeMidnight = timeSlots.filter(slot => !isAfterMidnight(slot.time));
    const afterMidnight = timeSlots.filter(slot => isAfterMidnight(slot.time));
    
    return {
      beforeMidnightSlots: showAllSlots ? beforeMidnight : beforeMidnight.slice(0, 18),
      afterMidnightSlots: showAllSlots ? afterMidnight : afterMidnight.slice(0, 18),
      hasAfterMidnightSlots: afterMidnight.length > 0
    };
  }, [timeSlots, showAllSlots]);
  
  const totalDisplayedSlots = beforeMidnightSlots.length + afterMidnightSlots.length;
  const hasAvailableSlots = timeSlots.some(slot => slot.isAvailable);
  
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

  if (timeSlots.length === 0 || !hasAvailableSlots) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available time slots'}
        </h3>
      </div>
    );
  }

  const renderTimeSlotButton = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;
    const slotIsAfterMidnight = isAfterMidnight(slot.time);
    
    return (
      <TooltipProvider key={slot.time}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              key={slot.time}
              variant="outline"
              onClick={() => slot.isAvailable && onTimeSelect(slot.time)}
              disabled={!slot.isAvailable}
              className={cn(
                "flex-shrink-0 transition-all duration-150",
                isSelected 
                  ? "bg-[#FDF9EF] border-[#e7bd71] text-black hover:bg-[#FDF9EF]" 
                  : slot.isAvailable
                    ? slotIsAfterMidnight 
                      ? "border-border bg-blue-50 hover:bg-blue-100" 
                      : "border-border bg-background hover:bg-background" 
                    : "bg-red-50 text-gray-600 border-red-100 cursor-not-allowed opacity-80"
              )}
            >
              {formatTime(slot.time, language === 'ar')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {slot.isAvailable 
              ? language === 'ar' ? 'متاح' : 'Available'
              : language === 'ar' ? 'غير متاح' : 'Unavailable'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">
        {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
      </h3>
      <div className="w-full">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
          <div className="overflow-x-auto px-4 py-4 bg-white">
            {/* Before midnight slots */}
            <div className="flex flex-wrap gap-3 mb-4">
              {beforeMidnightSlots.map(slot => renderTimeSlotButton(slot))}
            </div>
              
            {/* Midnight divider - only show if there are after-midnight slots */}
            {hasAfterMidnightSlots && (
              <div className="flex items-center w-full justify-center my-3">
                <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                <Clock12 className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500 mx-2">
                  {t('midnight')}
                </span>
                <div className="h-px bg-gray-200 flex-grow mx-2"></div>
              </div>
            )}
            
            {/* After midnight slots */}
            {hasAfterMidnightSlots && (
              <div className="flex flex-wrap gap-3">
                {afterMidnightSlots.map(slot => renderTimeSlotButton(slot))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {timeSlots.length > totalDisplayedSlots && (
        <Button 
          variant="ghost" 
          onClick={onToggleShowAll} 
          className="w-full mt-2"
        >
          {showAllSlots 
            ? t('show.less')
            : t('show.more')}
        </Button>
      )}
    </div>
  );
});

TimeSlotPicker.displayName = "TimeSlotPicker";
