
import { useState, useEffect } from "react";
import { BarberCard } from "./barber/BarberCard";
import { TimeSlotPicker } from "./barber/TimeSlotPicker";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { TimeSlot } from "@/types/booking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { SelectedService } from "@/types/service";

interface BarberSelectionProps {
  selectedBarber: string | undefined;
  onBarberSelect: (barber: string) => void;
  employees: any[] | undefined;
  isLoading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  selectedServices?: SelectedService[];
}

export const BarberSelection = ({
  selectedBarber,
  onBarberSelect,
  employees,
  isLoading,
  selectedDate,
  selectedTime,
  onTimeSelect,
  selectedServices = []
}: BarberSelectionProps) => {
  const { t, language } = useLanguage();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const timeSlotUtils = useTimeSlots();

  // Get the selected employee object
  const selectedEmployeeObj = employees?.find(emp => emp.id === selectedBarber);

  // Get available time slots for the selected employee on the selected date
  const {
    data: timeSlots,
    isLoading: timeSlotsLoading
  } = useQuery({
    queryKey: ['timeSlots', selectedBarber, selectedDate?.toISOString()],
    queryFn: () => selectedEmployeeObj && selectedDate ? timeSlotUtils.getAvailableTimeSlots(selectedEmployeeObj, selectedDate) : Promise.resolve([]),
    enabled: !!selectedBarber && !!selectedDate && !!selectedEmployeeObj
  });
  
  useEffect(() => {
    if (timeSlots) {
      setAvailableTimeSlots(timeSlots);
    }
  }, [timeSlots]);
  
  useEffect(() => {
    // Reset selected time when changing barber
    onTimeSelect('');
  }, [selectedBarber, onTimeSelect]);
  
  const handleToggleShowAll = () => {
    setShowAllSlots(prev => !prev);
  };
  
  return <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">{t('select.barber')}</h2>
      
      {isLoading ? <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
        </div> : employees && employees.length > 0 ? <div className="space-y-4">
          {employees.map(employee => <div key={employee.id} className="space-y-4">
              <BarberCard 
                id={employee.id} 
                name={employee.name} 
                name_ar={employee.name_ar} 
                photo_url={employee.photo_url} 
                nationality={employee.nationality} 
                isAvailable={timeSlotUtils.isEmployeeAvailable(employee, selectedDate)} 
                isSelected={selectedBarber === employee.id} 
                onSelect={() => onBarberSelect(employee.id)} 
              />
              
              {/* Show time slots directly under the selected barber */}
              {selectedBarber === employee.id && selectedDate && (
                <div className="pt-4 border-t border-gray-200 ml-4 pl-4 border-l">
                  {timeSlotsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-2"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 w-20 bg-gray-200 rounded"></div>)}
                      </div>
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <TimeSlotPicker 
                      timeSlots={availableTimeSlots} 
                      selectedTime={selectedTime} 
                      onTimeSelect={onTimeSelect} 
                      showAllSlots={showAllSlots} 
                      onToggleShowAll={handleToggleShowAll}
                      selectedServices={selectedServices}
                    />
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                      {t('no.slots.available')}
                    </div>
                  )}
                </div>
              )}
            </div>)}
        </div> : <div className="text-center py-8 text-gray-500">
          {t('no.barbers.available')}
        </div>}
    </div>;
};
