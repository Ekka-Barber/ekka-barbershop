
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import { useBookingContext } from '@/contexts/BookingContext';

interface DateTimeStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateTimeStep = ({
  selectedDate,
  onDateSelect
}: DateTimeStepProps) => {
  const { state } = useBookingContext();

  // Ensure we have the required data
  if (state.selectedServices.length === 0) {
    console.error('No services selected in DateTimeStep');
    return null;
  }

  return (
    <DateTimeSelection />
  );
};
