
import { BarberSelection } from '@/components/booking/BarberSelection';
import { BarberDetails } from '@/types/booking';

interface BarberStepProps {
  employees: BarberDetails[];
  isLoading: boolean;
  selectedBarber: string | undefined;
  onBarberSelect: (id: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export const BarberStep = ({
  employees,
  isLoading,
  selectedBarber,
  onBarberSelect,
  selectedDate,
  selectedTime,
  onTimeSelect
}: BarberStepProps) => {
  return (
    <BarberSelection
      employees={employees}
      isLoading={isLoading}
      selectedBarber={selectedBarber}
      onBarberSelect={onBarberSelect}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onTimeSelect={onTimeSelect}
    />
  );
};
