
import { useEffect, useState } from "react";
import { BarberSelection } from "../BarberSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectedService } from "@/types/service";
import { useQuery } from "@tanstack/react-query";

interface BarberStepProps {
  selectedBarber: string | undefined;
  onBarberSelect: (barber: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedDate?: Date;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  selectedServices: SelectedService[];
}

const BarberStep: React.FC<BarberStepProps> = ({
  selectedBarber,
  onBarberSelect,
  employees,
  employeesLoading,
  selectedDate,
  selectedTime,
  setSelectedTime,
  selectedServices
}) => {
  // Calculate total duration for all selected services
  const serviceDuration = selectedServices.reduce(
    (total, service) => total + service.duration,
    0
  );

  // Get the selected employee object
  const selectedEmployeeObj = employees?.find(emp => emp.id === selectedBarber);

  // Reset selected time when changing barber
  useEffect(() => {
    setSelectedTime('');
  }, [selectedBarber, setSelectedTime]);

  return (
    <div className="space-y-6">
      {employeesLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <BarberSelection
          employees={employees}
          selectedBarber={selectedBarber}
          onBarberSelect={onBarberSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          isLoading={false}
          selectedServices={selectedServices}
        />
      )}
    </div>
  );
};

export default BarberStep;
