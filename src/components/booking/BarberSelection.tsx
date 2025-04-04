
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberCard } from "./barber/BarberCard";
import { TimeSlotPicker } from "./barber/TimeSlotPicker";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { TimeSlot } from "@/utils/timeSlotTypes";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

/**
 * Interface for Employee data
 * @interface Employee
 */
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

/**
 * Interface for BarberSelection component props
 * @interface BarberSelectionProps
 */
interface BarberSelectionProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  selectedBarber: string | undefined;
  onBarberSelect: (barberId: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

/**
 * Skeleton component for loading state
 * @returns {JSX.Element} Skeleton UI for BarberSelection
 */
const BarberSelectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
      ))}
    </div>
  );
};

/**
 * Component for selecting a barber and time slot
 * Displays available barbers and their time slots based on the selected date
 * 
 * @param {BarberSelectionProps} props - Component properties
 * @returns {JSX.Element} The BarberSelection component
 */
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

  // Filter employees to show only barbers and managers
  const filteredEmployees = useMemo(() => 
    employees?.filter(employee => 
      employee.role === 'barber' || employee.role === 'manager'
    ) || [],
  [employees]);

  /**
   * Updates time slots based on selected barber and date
   */
  const updateTimeSlots = useCallback(async () => {
    if (selectedBarber && selectedDate) {
      const selectedEmployee = employees?.find(emp => emp.id === selectedBarber);
      
      if (selectedEmployee && isEmployeeAvailable(selectedEmployee, selectedDate)) {
        try {
          setIsLoadingSlots(true);
          const slots = await getAvailableTimeSlots(selectedEmployee, selectedDate);
          
          const availableSlots = slots.filter(slot => slot.isAvailable);
          setEmployeeTimeSlots(slots);
          
          if (availableSlots.length === 0) {
            logger.warn(`No available slots for barber ${selectedBarber} on ${selectedDate}`);
            toast({
              title: language === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available time slots',
              description: language === 'ar' 
                ? 'يرجى اختيار تاريخ أو حلاق آخر' 
                : 'Please select another date or barber',
              variant: "default"
            });
          }
          
          if (selectedTime && !slots.some(slot => slot.time === selectedTime && slot.isAvailable)) {
            onTimeSelect('');
            logger.warn(`Previously selected time ${selectedTime} is no longer available`);
            toast({
              title: language === 'ar' ? 'الوقت لم يعد متاحًا' : 'Time no longer available',
              description: language === 'ar' ? 'يرجى اختيار وقت آخر' : 'Please select another time',
              variant: "destructive"
            });
          }
        } catch (error) {
          logger.error("Error fetching time slots:", error);
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

  /**
   * Toggles showing all time slots or only available ones
   */
  const handleToggleShowAll = useCallback(() => {
    setShowAllSlots(prev => !prev);
  }, []);

  // Update time slots when barber or date changes
  useEffect(() => {
    updateTimeSlots();
  }, [updateTimeSlots]);

  /**
   * Handles barber selection if the barber is available
   * 
   * @param {string} barberId - ID of the selected barber
   * @param {boolean} isAvailable - Whether the barber is available on the selected date
   */
  const handleBarberSelect = useCallback((barberId: string, isAvailable: boolean) => {
    if (isAvailable) {
      logger.debug(`Selected barber: ${barberId}`);
      onBarberSelect(barberId);
      onTimeSelect('');
      setShowAllSlots(false);
    } else {
      logger.debug(`Attempted to select unavailable barber: ${barberId}`);
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
