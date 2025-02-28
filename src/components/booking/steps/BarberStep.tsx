
import { BarberSelection } from "../BarberSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberSelectionSkeleton } from "../BarberSelectionSkeleton";

interface BarberStepProps {
  selectedBarber: string | undefined;
  onBarberSelect: (barber: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
}

const BarberStep: React.FC<BarberStepProps> = ({
  selectedBarber,
  onBarberSelect,
  employees,
  employeesLoading,
  selectedDate,
  selectedTime,
  setSelectedTime
}) => {
  if (employeesLoading) {
    return <BarberSelectionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <BarberSelection
        selectedBarber={selectedBarber}
        onBarberSelect={onBarberSelect}
        employees={employees}
        isLoading={employeesLoading}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
      />
    </div>
  );
};

export default BarberStep;
