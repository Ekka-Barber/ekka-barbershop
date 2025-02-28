
import { BookingSummary } from "../BookingSummary";
import { CustomerDetails } from "@/hooks/booking/useBookingState";
import { SelectedService } from "@/types/service";

interface SummaryStepProps {
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarber?: string;
  customerDetails: CustomerDetails;
  totalPrice: number;
  branch?: any;
  employees?: any[];
}

export const SummaryStep = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarber,
  customerDetails,
  totalPrice,
  branch,
  employees
}: SummaryStepProps) => {
  // Find the selected employee
  const selectedEmployee = employees?.find(
    (employee) => employee.id === selectedBarber
  );

  return (
    <BookingSummary
      bookingDetails={{
        selectedServices,
        selectedDate,
        selectedTime,
        selectedBarber: selectedEmployee,
        totalPrice,
        totalDuration: selectedServices.reduce((sum, service) => sum + service.duration, 0)
      }}
      customerDetails={customerDetails}
      branch={branch}
    />
  );
};

export default SummaryStep;
