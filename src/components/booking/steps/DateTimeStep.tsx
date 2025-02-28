
import { DateTimeSelection } from "../DateTimeSelection";

interface DateTimeStepProps {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  branch?: any;
}

export const DateTimeStep = ({
  selectedDate,
  setSelectedDate,
  branch
}: DateTimeStepProps) => {
  return (
    <DateTimeSelection
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      branch={branch}
    />
  );
};

export default DateTimeStep;
