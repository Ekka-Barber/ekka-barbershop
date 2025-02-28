
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock12, AlertCircle } from "lucide-react";
import { formatTime } from "@/utils/timeFormatting";
import { TimeSlot } from "@/utils/timeSlotUtils";
import { useBookingSettings } from "@/hooks/useBookingSettings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { SelectedService } from "@/types/service";

export interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  showAllSlots: boolean;
  onToggleShowAll: () => void;
  selectedServices?: SelectedService[];
}

export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  showAllSlots,
  onToggleShowAll,
  selectedServices = []
}: TimeSlotPickerProps) => {
  const { language } = useLanguage();
  const { data: bookingSettings, isLoading: isSettingsLoading } = useBookingSettings();
  
  // Calculate total service duration
  const [totalServiceDuration, setTotalServiceDuration] = useState<number>(0);
  
  useEffect(() => {
    // Sum up all service durations
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
    setTotalServiceDuration(totalDuration);
  }, [selectedServices]);

  const displayedTimeSlots = showAllSlots ? timeSlots : timeSlots.slice(0, 6);
  
  if (timeSlots.length === 0 || isSettingsLoading) {
    return <div className="space-y-4">
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
      </div>;
  }
  
  const needsSeparator = (currentTime: string, prevTime: string) => {
    return prevTime === "23:30" && currentTime === "00:00";
  };
  
  // Check if a slot has enough consecutive time for the services
  const hasEnoughTime = (slot: TimeSlot): boolean => {
    if (totalServiceDuration <= 0) return true;
    
    // If slot is not available, it doesn't have enough time
    if (!slot.isAvailable) return false;
    
    // Get slot duration in minutes
    const slotDuration = bookingSettings?.slot_duration_minutes || 30;
    
    // Find index of current slot
    const slotIndex = timeSlots.findIndex(s => s.time === slot.time);
    if (slotIndex === -1) return false;
    
    // Calculate how many consecutive slots we need
    const requiredSlots = Math.ceil(totalServiceDuration / slotDuration);
    
    // Check if we have enough consecutive available slots
    let consecutiveAvailable = 0;
    for (let i = slotIndex; i < timeSlots.length; i++) {
      if (timeSlots[i].isAvailable) {
        consecutiveAvailable++;
        if (consecutiveAvailable >= requiredSlots) return true;
      } else {
        break; // Break the chain of available slots
      }
    }
    
    return false;
  };
  
  // Get status and tooltip message for a time slot
  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return {
        status: "unavailable",
        message: language === 'ar' ? 'هذا الموعد غير متاح' : 'This time slot is not available'
      };
    }
    
    if (!hasEnoughTime(slot)) {
      return {
        status: "insufficient-time",
        message: language === 'ar' 
          ? `مدة الخدمات المختارة (${totalServiceDuration} دقيقة) تتجاوز الوقت المتاح`
          : `Selected services (${totalServiceDuration} mins) exceed available time`
      };
    }
    
    return {
      status: "available",
      message: ""
    };
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
                const { status, message } = getSlotStatus(slot);
                
                return (
                  <>
                    {showSeparator && (
                      <div className="flex items-center mx-2" key={`separator-${index}`}>
                        <Clock12 className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                    
                    <TooltipProvider key={slot.time}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              onClick={() => (status !== "unavailable" && hasEnoughTime(slot)) && onTimeSelect(slot.time)}
                              disabled={status === "unavailable"}
                              className={cn(
                                "flex-shrink-0 relative",
                                status === "unavailable" && "bg-red-50 hover:bg-red-50 cursor-not-allowed text-gray-400 border-red-100",
                                status === "insufficient-time" && "bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-800",
                                selectedTime === slot.time && "bg-[#C4A484] text-white border-[#C4A484]"
                              )}
                            >
                              {formatTime(slot.time, language === 'ar')}
                              {status === "insufficient-time" && (
                                <AlertCircle className="h-3 w-3 absolute -top-1 -right-1 text-amber-600" />
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {message && (
                          <TooltipContent side="bottom" className="max-w-[200px] text-center">
                            <p>{message}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
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
          className="w-full mt-2 hover:bg-gray-100 text-gray-700"
        >
          {showAllSlots ? 
            language === 'ar' ? 'عرض أقل' : 'Show Less' : 
            language === 'ar' ? 'للمزيد' : 'Show More'}
        </Button>
      )}
    </div>
  );
};
