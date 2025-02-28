
import { BarberSelection } from "../BarberSelection";

interface BarberStepProps {
  selectedBarber: string | undefined;
  setSelectedBarber: (barber: string) => void;
  employees: any[] | undefined;
  employeesLoading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
}

export const BarberStep = ({
  selectedBarber,
  setSelectedBarber,
  employees,
  employeesLoading,
  selectedDate,
  selectedTime,
  setSelectedTime
}: BarberStepProps) => {
  return (
    <BarberSelection
      selectedBarber={selectedBarber}
      onBarberSelect={setSelectedBarber}
      employees={employees}
      isLoading={employeesLoading}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onTimeSelect={setSelectedTime}
    />
  );
};
