
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
  
  // Log all time slots for debugging
  console.log("All time slots received:", timeSlots.map(slot => ({
    time: slot.time,
    isAvailable: slot.isAvailable,
    isAfterMidnight: isAfterMidnight(slot.time)
  })));
  
  // Group slots by time period (before/after midnight) and availability
  const groupedSlots = useMemo(() => {
    const groups = {
      // Regular slots (before midnight)
      regularAvailable: timeSlots.filter(slot => !isAfterMidnight(slot.time) && slot.isAvailable),
      regularUnavailable: timeSlots.filter(slot => !isAfterMidnight(slot.time) && !slot.isAvailable),
      
      // After-midnight slots
      afterMidnightAvailable: timeSlots.filter(slot => isAfterMidnight(slot.time) && slot.isAvailable),
      afterMidnightUnavailable: timeSlots.filter(slot => isAfterMidnight(slot.time) && !slot.isAvailable)
    };
    
    console.log("Grouped slots:", {
      regularAvailable: groups.regularAvailable.length,
      regularUnavailable: groups.regularUnavailable.length,
      afterMidnightAvailable: groups.afterMidnightAvailable.length,
      afterMidnightUnavailable: groups.afterMidnightUnavailable.length
    });
    
    return groups;
  }, [timeSlots]);
  
  // Check if there are any available slots
  const hasAvailableSlots = useMemo(() => {
    return groupedSlots.regularAvailable.length > 0 || groupedSlots.afterMidnightAvailable.length > 0;
  }, [groupedSlots]);
  
  // Check if there are any after-midnight slots
  const hasAfterMidnightSlots = useMemo(() => {
    return groupedSlots.afterMidnightAvailable.length > 0 || groupedSlots.afterMidnightUnavailable.length > 0;
  }, [groupedSlots]);
  
  // Determine which slots to display based on showAllSlots flag
  const displayedSlots = useMemo(() => {
    // Combine available and unavailable slots, but prioritize available ones
    const allRegularSlots = [...groupedSlots.regularAvailable, ...groupedSlots.regularUnavailable];
    const allAfterMidnightSlots = [...groupedSlots.afterMidnightAvailable, ...groupedSlots.afterMidnightUnavailable];
    
    // If showAllSlots is true, return all slots, otherwise limit to first 6
    const regulars = showAllSlots ? allRegularSlots : allRegularSlots.slice(0, 6);
    const afterMidnights = showAllSlots ? allAfterMidnightSlots : allAfterMidnightSlots.slice(0, 6);
    
    return {
      regular: regulars,
      afterMidnight: afterMidnights
    };
  }, [groupedSlots, showAllSlots]);
  
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
                    : "border-rose-200 bg-rose-50 text-gray-400 cursor-not-allowed"
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

  // Calculate total slots for "Show More" button logic
  const totalSlots = timeSlots.length;

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
            {displayedSlots.regular.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {displayedSlots.regular.map(slot => renderTimeSlotButton(slot))}
              </div>
            )}
              
            {/* After midnight separator and slots */}
            {hasAfterMidnightSlots && displayedSlots.afterMidnight.length > 0 && (
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
                  {displayedSlots.afterMidnight.map(slot => renderTimeSlotButton(slot))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {totalSlots > 6 && (
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
