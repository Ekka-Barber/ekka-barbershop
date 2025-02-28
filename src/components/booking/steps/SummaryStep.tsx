
import { BookingSummary } from "../BookingSummary";
import { SelectedService } from "@/types/service";
import { CustomerDetails } from "@/types/booking";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface SummaryStepProps {
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarber?: string;
  customerDetails: CustomerDetails;
  totalPrice: number;
  branch: any;
  employees: any[];
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarber,
  customerDetails,
  totalPrice,
  branch,
  employees
}) => {
  const { language } = useLanguage();
  
  // Calculate total duration
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  
  // Find selected barber details
  const selectedBarberDetails = employees.find(emp => emp.id === selectedBarber);

  // Create the booking details object
  const bookingDetails = {
    selectedServices,
    selectedDate,
    selectedTime,
    selectedBarber: selectedBarberDetails,
    totalPrice,
    totalDuration
  };
  
  return (
    <BookingSummary
      selectedServices={selectedServices}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarber={selectedBarberDetails}
      customerDetails={customerDetails}
      totalPrice={totalPrice}
      totalDuration={totalDuration}
      branch={branch}
      language={language}
    />
  );
};

export default SummaryStep;
