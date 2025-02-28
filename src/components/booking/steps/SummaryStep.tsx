
import { BookingSummary } from "../BookingSummary";

interface SummaryStepProps {
  selectedServices: any[];
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  selectedBarberName: string | undefined;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  totalPrice: number;
  branch: any;
}

export const SummaryStep = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  totalPrice,
  branch
}: SummaryStepProps) => {
  return (
    <BookingSummary
      selectedServices={selectedServices}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarberName={selectedBarberName}
      customerDetails={customerDetails}
      totalPrice={totalPrice}
      branch={branch}
    />
  );
};
