
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
  
  // Group slots by availability and time period
  const groupedSlots = useMemo(() => {
    // Log all time slots for debugging
    console.log("Time slots before grouping:", timeSlots.map(slot => ({
      time: slot.time,
      isAvailable: slot.isAvailable,
      isAfterMidnight: isAfterMidnight(slot.time)
    })));
    
    // Filter and group slots by time period and availability
    return {
      // Available slots (before midnight)
      availableSlots: timeSlots.filter(slot => !isAfterMidnight(slot.time) && slot.isAvailable),
      
      // Unavailable slots (before midnight)
      unavailableSlots: timeSlots.filter(slot => !isAfterMidnight(slot.time) && !slot.isAvailable),
      
      // After-midnight available slots
      afterMidnightAvailable: timeSlots.filter(slot => isAfterMidnight(slot.time) && slot.isAvailable),
      
      // After-midnight unavailable slots
      afterMidnightUnavailable: timeSlots.filter(slot => isAfterMidnight(slot.time) && !slot.isAvailable)
    };
  }, [timeSlots]);
  
  // Check if there are any available slots
  const hasAvailableSlots = useMemo(() => {
    return groupedSlots.availableSlots.length > 0 || groupedSlots.afterMidnightAvailable.length > 0;
  }, [groupedSlots]);
  
  // Check if there are any after-midnight slots
  const hasAfterMidnightSlots = useMemo(() => {
    return groupedSlots.afterMidnightAvailable.length > 0 || groupedSlots.afterMidnightUnavailable.length > 0;
  }, [groupedSlots]);
  
  // Determine which slots to display based on showAllSlots flag
  const displayedSlots = useMemo(() => {
    // If showAllSlots is true, return all slots, otherwise limit to a reasonable number
    const regularAvailable = showAllSlots 
      ? groupedSlots.availableSlots 
      : groupedSlots.availableSlots.slice(0, 12);
      
    const regularUnavailable = showAllSlots 
      ? groupedSlots.unavailableSlots 
      : groupedSlots.unavailableSlots.slice(0, 6);
      
    const afterMidnightAvailable = showAllSlots 
      ? groupedSlots.afterMidnightAvailable 
      : groupedSlots.afterMidnightAvailable.slice(0, 12);
      
    const afterMidnightUnavailable = showAllSlots 
      ? groupedSlots.afterMidnightUnavailable 
      : groupedSlots.afterMidnightUnavailable.slice(0, 6);
    
    console.log("After-midnight available slots:", afterMidnightAvailable.length);
    console.log("After-midnight unavailable slots:", afterMidnightUnavailable.length);
    
    return {
      regularAvailable,
      regularUnavailable,
      afterMidnightAvailable,
      afterMidnightUnavailable
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
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              )}
            >
              {formatTime(slot.time, language === 'ar')}
              {slotIsAfterMidnight && <span className="ml-1 text-xs text-blue-500">+1</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {slotIsAfterMidnight 
              ? (slot.isAvailable 
                ? language === 'ar' ? 'متاح (اليوم التالي)' : 'Available (next day)' 
                : language === 'ar' ? 'غير متاح (اليوم التالي)' : 'Unavailable (next day)')
              : (slot.isAvailable 
                ? language === 'ar' ? 'متاح' : 'Available' 
                : language === 'ar' ? 'غير متاح' : 'Unavailable')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Calculate total slots for "Show More" button logic
  const totalSlots = timeSlots.length;
  const totalDisplayedSlots = 
    displayedSlots.regularAvailable.length + 
    displayedSlots.regularUnavailable.length + 
    displayedSlots.afterMidnightAvailable.length + 
    displayedSlots.afterMidnightUnavailable.length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">
        {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
      </h3>
      <div className="w-full">
        <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
          <div className="overflow-x-auto px-4 py-4 bg-white">
            {/* Available slots section (before midnight) */}
            {displayedSlots.regularAvailable.length > 0 && (
              <>
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'المواعيد المتاحة' : 'Available times'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {displayedSlots.regularAvailable.map(slot => renderTimeSlotButton(slot))}
                </div>
              </>
            )}
            
            {/* Unavailable slots section (before midnight) - will be visually distinct */}
            {displayedSlots.regularUnavailable.length > 0 && (
              <>
                <div className="flex items-center my-3">
                  <span className="text-sm font-medium text-gray-500">
                    {language === 'ar' ? 'المواعيد غير المتاحة' : 'Unavailable times'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4 opacity-80">
                  {displayedSlots.regularUnavailable.map(slot => renderTimeSlotButton(slot))}
                </div>
              </>
            )}
              
            {/* After midnight separator and available slots */}
            {hasAfterMidnightSlots && (
              <>
                <div className="flex items-center w-full justify-center my-3">
                  <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                  <Clock12 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 mx-2">
                    {language === 'ar' ? 'اليوم التالي' : 'Next day'}
                  </span>
                  <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                </div>
                
                {/* After-midnight available slots */}
                {displayedSlots.afterMidnightAvailable.length > 0 && (
                  <>
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'ar' ? 'المواعيد المتاحة' : 'Available times'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {displayedSlots.afterMidnightAvailable.map(slot => renderTimeSlotButton(slot))}
                    </div>
                  </>
                )}
                
                {/* After-midnight unavailable slots */}
                {displayedSlots.afterMidnightUnavailable.length > 0 && (
                  <>
                    <div className="flex items-center my-3">
                      <span className="text-sm font-medium text-gray-500">
                        {language === 'ar' ? 'المواعيد غير المتاحة' : 'Unavailable times'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 opacity-80">
                      {displayedSlots.afterMidnightUnavailable.map(slot => renderTimeSlotButton(slot))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {totalSlots > totalDisplayedSlots && (
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
