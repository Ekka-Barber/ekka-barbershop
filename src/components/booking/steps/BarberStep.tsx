
import BarberSelection from '@/components/booking/BarberSelection';
import { Employee } from '@/types/booking';
import { useBookingContext } from '@/contexts/BookingContext';

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
  const { state } = useBookingContext();

  // Ensure we have the required data
  if (!selectedDate) {
    console.error('No date selected in BarberStep');
    return null;
  }

  return (
    <BarberSelection />
  );
};
