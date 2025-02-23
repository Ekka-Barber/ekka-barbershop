import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberCard } from "./barber/BarberCard";
import { TimeSlotPicker } from "./barber/TimeSlotPicker";
import { useTimeSlots } from "@/hooks/useTimeSlots";

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
  const [showAllSlots, setShowAllSlots] = useState(false);
  const { getAvailableTimeSlots, isEmployeeAvailable } = useTimeSlots();
  const [employeeTimeSlots, setEmployeeTimeSlots] = useState<{ time: string; isAvailable: boolean; }[]>([]);

  const updateTimeSlots = async () => {
    if (selectedBarber && selectedDate) {
      const selectedEmployee = employees?.find(emp => emp.id === selectedBarber);
      if (selectedEmployee && isEmployeeAvailable(selectedEmployee, selectedDate)) {
        const slots = await getAvailableTimeSlots(selectedEmployee, selectedDate);
        setEmployeeTimeSlots(slots);
      } else {
        setEmployeeTimeSlots([]);
      }
    } else {
      setEmployeeTimeSlots([]);
    }
  };

  useEffect(() => {
    updateTimeSlots();
  }, [selectedBarber, selectedDate]);

  if (isLoading) {
    return <BarberSelectionSkeleton />;
  }

  const filteredEmployees = employees?.filter(
    employee => employee.role === 'barber' || employee.role === 'manager'
  );

  if (filteredEmployees?.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">{language === 'ar' ? 'لا يوجد حلاقين متاحين' : 'No barbers available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees?.map((employee) => {
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
                onSelect={() => {
                  if (isAvailable) {
                    onBarberSelect(employee.id);
                    onTimeSelect('');
                    setShowAllSlots(false);
                  }
                }}
              />

              {isSelected && isAvailable && (
                <TimeSlotPicker
                  timeSlots={employeeTimeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={onTimeSelect}
                  showAllSlots={showAllSlots}
                  onToggleShowAll={() => setShowAllSlots(!showAllSlots)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
