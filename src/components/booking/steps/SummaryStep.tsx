
import { BookingSummary } from "../BookingSummary";
import { SelectedService } from "@/types/service";
import { CustomerDetails } from "@/types/booking";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface SummaryStepProps {
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarber?: any;
  customerDetails: CustomerDetails;
  totalPrice: number;
  totalDuration: number;
  branch: any;
  employees: any[];
  handleSubmitBooking?: () => void;
  submitting?: boolean;
  buttonText?: string;
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  selectedServices,
  selectedDate,
  selectedTime,
  selectedBarber,
  customerDetails,
  totalPrice,
  totalDuration,
  branch,
  employees,
  handleSubmitBooking,
  submitting,
  buttonText
}) => {
  const { language } = useLanguage();
  
  return (
    <BookingSummary
      selectedServices={selectedServices}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarber={selectedBarber}
      customerDetails={customerDetails}
      totalPrice={totalPrice}
      totalDuration={totalDuration}
      branch={branch}
      language={language}
    />
  );
};

export default SummaryStep;
