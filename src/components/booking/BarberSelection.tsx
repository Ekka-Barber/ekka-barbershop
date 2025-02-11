
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberCard } from "./barber/BarberCard";
import { TimeSlotPicker } from "./barber/TimeSlotPicker";
import { useTimeSlots, TimeSlot } from "@/hooks/useTimeSlots";

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [employeeAvailability, setEmployeeAvailability] = useState<Record<string, boolean>>({});

  // Fetch availability for all employees
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!employees || !selectedDate) return;
      
      const availability: Record<string, boolean> = {};
      for (const employee of employees) {
        availability[employee.id] = await isEmployeeAvailable(employee, selectedDate);
      }
      setEmployeeAvailability(availability);
    };

    fetchAvailability();
  }, [employees, selectedDate, isEmployeeAvailable]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedBarber && selectedDate) {
        setLoadingTimeSlots(true);
        const selectedEmployee = employees?.find(emp => emp.id === selectedBarber);
        if (selectedEmployee) {
          const slots = await getAvailableTimeSlots(selectedEmployee, selectedDate);
          setTimeSlots(slots);
        }
        setLoadingTimeSlots(false);
      } else {
        setTimeSlots([]);
      }
    };

    fetchTimeSlots();
  }, [selectedBarber, selectedDate, employees, getAvailableTimeSlots]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filteredEmployees = employees?.filter(
    employee => employee.role === 'barber' || employee.role === 'manager'
  );

  if (filteredEmployees?.length === 0) {
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
        {filteredEmployees?.map((employee) => {
          const isSelected = selectedBarber === employee.id;
          const isAvailable = employeeAvailability[employee.id] ?? false;
          
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
                  onBarberSelect(employee.id);
                  onTimeSelect('');
                  setShowAllSlots(false);
                }}
              />

              {isSelected && (
                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={onTimeSelect}
                  showAllSlots={showAllSlots}
                  onToggleShowAll={() => setShowAllSlots(!showAllSlots)}
                  isLoading={loadingTimeSlots}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
