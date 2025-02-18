
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';

interface DateTimeStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateTimeStep = ({
  selectedDate,
  onDateSelect
}: DateTimeStepProps) => {
  return (
    <DateTimeSelection
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
    />
  );
};
