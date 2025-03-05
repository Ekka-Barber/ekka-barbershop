
import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeSlot } from "@/utils/timeSlotTypes";
import { formatTime } from "@/utils/timeFormatting";
import { sortTimeSlots } from "@/utils/timeSlotSorting";
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
  
  // Process time slots
  const processedTimeSlots = useMemo(() => {
    // Log all time slots for debugging
    console.log("Raw time slots:", timeSlots.map(slot => ({
      time: slot.time,
      isAvailable: slot.isAvailable
    })));
    
    // Sort the slots chronologically
    const sortedSlots = sortTimeSlots(timeSlots);
    
    // Return all slots or limit them based on showAllSlots flag
    return showAllSlots 
      ? sortedSlots 
      : sortedSlots.slice(0, 24); // Show first 24 slots
  }, [timeSlots, showAllSlots]);
  
  // Check if there are any available slots
  const hasAvailableSlots = useMemo(() => {
    return timeSlots.some(slot => slot.isAvailable);
  }, [timeSlots]);
  
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

  // Show message when no slots at all or no available slots
  if (timeSlots.length === 0 || !hasAvailableSlots) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">
          {language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available time slots'}
        </h3>
      </div>
    );
  }

  // Render time slot button with appropriate styling based on availability
  const renderTimeSlotButton = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;
    
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
                    ? "border-border bg-background hover:bg-background" 
                    : "border-red-100 bg-red-50 text-red-400 cursor-not-allowed"
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
            <div className="flex flex-wrap gap-3">
              {processedTimeSlots.map(slot => renderTimeSlotButton(slot))}
            </div>
          </div>
        </div>
      </div>
      
      {timeSlots.length > processedTimeSlots.length && (
        <Button 
          variant="ghost" 
          onClick={onToggleShowAll} 
          className="w-full mt-2"
        >
          {showAllSlots 
            ? language === 'ar' ? 'عرض أقل' : 'Show Less' 
            : language === 'ar' ? 'عرض المزيد' : 'Show More'}
        </Button>
      )}
    </div>
  );
});

TimeSlotPicker.displayName = "TimeSlotPicker";
