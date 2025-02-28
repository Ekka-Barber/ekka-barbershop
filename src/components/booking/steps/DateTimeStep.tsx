
import { DateTimeSelection } from "../DateTimeSelection";
import { Skeleton } from "@/components/ui/skeleton";

interface DateTimeStepProps {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  branch: any;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  selectedDate,
  setSelectedDate,
  branch
}) => {
  if (!selectedDate) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <DateTimeSelection
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      branch={branch}
    />
  );
};

export default DateTimeStep;
