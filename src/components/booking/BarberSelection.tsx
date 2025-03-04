
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberCard } from "./barber/BarberCard";
import { TimeSlotPicker } from "./barber/TimeSlotPicker";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { TimeSlot } from "@/utils/timeSlotUtils";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: string;
  photo_url: string | null;
  nationality: string | null;
  working_hours?: Record<string, string[]>;
  off_days?: string[];
}

interface BarberSelectionProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  selectedBarber: string | undefined;
  onBarberSelect: (barberId: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

const BarberSelectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
      ))}
    </div>
  );
};

export const BarberSelection = ({
  employees,
  isLoading,
  selectedBarber,
  onBarberSelect,
  selectedDate,
  selectedTime,
  onTimeSelect
}: BarberSelectionProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showAllSlots, setShowAllSlots] = useState(false);
  const { getAvailableTimeSlots, isEmployeeAvailable } = useTimeSlots();
  const [employeeTimeSlots, setEmployeeTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Filter employees just once when they change
  const filteredEmployees = useMemo(() => 
    employees?.filter(employee => 
      employee.role === 'barber' || employee.role === 'manager'
    ) || [],
  [employees]);

  // Time slot update with error handling
  const updateTimeSlots = useCallback(async () => {
    if (selectedBarber && selectedDate) {
      const selectedEmployee = employees?.find(emp => emp.id === selectedBarber);
      
      if (selectedEmployee && isEmployeeAvailable(selectedEmployee, selectedDate)) {
        try {
          setIsLoadingSlots(true);
          const slots = await getAvailableTimeSlots(selectedEmployee, selectedDate);
          setEmployeeTimeSlots(slots);
          
          // Clear selected time if it's no longer available
          if (selectedTime && !slots.some(slot => slot.time === selectedTime)) {
            onTimeSelect('');
            toast({
              title: language === 'ar' ? 'الوقت لم يعد متاحًا' : 'Time no longer available',
              description: language === 'ar' ? 'يرجى اختيار وقت آخر' : 'Please select another time',
              variant: "destructive" // Changed from "warning" to "destructive" as it's an allowed variant
            });
          }
        } catch (error) {
          console.error("Error fetching time slots:", error);
          toast({
            title: language === 'ar' ? 'خطأ في جلب المواعيد' : 'Error loading time slots',
            description: language === 'ar' ? 'يرجى المحاولة مرة أخرى' : 'Please try again',
            variant: "destructive"
          });
          setEmployeeTimeSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        setEmployeeTimeSlots([]);
      }
    } else {
      setEmployeeTimeSlots([]);
    }
  }, [selectedBarber, selectedDate, employees, getAvailableTimeSlots, isEmployeeAvailable, toast, language, selectedTime, onTimeSelect]);

  // Memoize the toggle function to prevent unnecessary re-renders
  const handleToggleShowAll = useCallback(() => {
    setShowAllSlots(prev => !prev);
  }, []);

  // Effect to update time slots when barber or date changes
  useEffect(() => {
    updateTimeSlots();
  }, [updateTimeSlots]);

  // Handle barber selection
  const handleBarberSelect = useCallback((barberId: string, isAvailable: boolean) => {
    if (isAvailable) {
      onBarberSelect(barberId);
      onTimeSelect(''); // Clear the selected time
      setShowAllSlots(false); // Reset the "show all" state
    }
  }, [onBarberSelect, onTimeSelect]);

  if (isLoading) {
    return <BarberSelectionSkeleton />;
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          {language === 'ar' ? 'لا يوجد حلاقين متاحين' : 'No barbers available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => {
          const isAvailable = isEmployeeAvailable(employee, selectedDate);
          const isSelected = selectedBarber === employee.id;
          
          return (
            <div key={employee.id} className="space-y-4">
              <BarberCard
                id={employee.id}
                name={employee.name}
                name_ar={employee.name_ar}
                photo_url={employee.photo_url}
                nationality={employee.nationality}
                isAvailable={isAvailable}
                isSelected={isSelected}
                onSelect={() => handleBarberSelect(employee.id, isAvailable)}
              />

              {isSelected && isAvailable && (
                <TimeSlotPicker
                  timeSlots={employeeTimeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={onTimeSelect}
                  showAllSlots={showAllSlots}
                  onToggleShowAll={handleToggleShowAll}
                  isLoading={isLoadingSlots}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
