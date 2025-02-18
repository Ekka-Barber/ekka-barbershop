
import BarberSelection from '@/components/booking/BarberSelection';
import { Employee } from '@/types/booking';

interface BarberStepProps {
  employees: Employee[];
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
    <BarberSelection />
  );
};
