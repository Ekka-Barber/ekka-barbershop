
import { BarberSelection } from "../BarberSelection";

interface BarberStepProps {
  selectedBarber: string;
  onBarberSelect: (barber: string) => void;
  employees: any[];
  isLoading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string;
  services: any[];
}

export const BarberStep = ({
  selectedBarber,
  onBarberSelect,
  employees,
  isLoading,
  selectedDate,
  selectedTime,
  services
}: BarberStepProps) => {
  return (
    <BarberSelection
      selectedBarber={selectedBarber}
      onBarberSelect={onBarberSelect}
      employees={employees}
      isLoading={isLoading}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      services={services}
    />
  );
};
