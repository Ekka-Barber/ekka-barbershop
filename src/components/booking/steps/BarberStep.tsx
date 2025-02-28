
import { BarberSelection } from "../BarberSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { BarberSelectionSkeleton } from "../BarberSelectionSkeleton";
import { SelectedService } from "@/types/service";

interface BarberStepProps {
  selectedBarber: string | undefined;
  onBarberSelect: (barber: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  selectedServices: SelectedService[];
}

const BarberStep: React.FC<BarberStepProps> = ({
  selectedBarber,
  onBarberSelect,
  employees,
  employeesLoading,
  selectedDate,
  selectedTime,
  setSelectedTime,
  selectedServices
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
        selectedServices={selectedServices}
      />
    </div>
  );
};

export default BarberStep;
