
import { DateTimeSelection } from "../DateTimeSelection";

interface DateTimeStepProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

export const DateTimeStep = ({
  selectedDate,
  setSelectedDate,
}: DateTimeStepProps) => {
  return (
    <DateTimeSelection
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
    />
  );
};
