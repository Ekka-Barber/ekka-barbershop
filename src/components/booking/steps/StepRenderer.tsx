
import { BookingStep } from "../BookingProgress";
import ServiceStep from "./ServiceStep";
import DateTimeStep from "./DateTimeStep";
import BarberStep from "./BarberStep";
import CustomerStep from "./CustomerStep";
import SummaryStep from "./SummaryStep";
import { CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { Category } from "@/types/service";

interface StepRendererProps {
  currentStep: BookingStep;
  selectedServices: SelectedService[];
  toggleService: (service: any) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  branch: any;
  selectedBarber: string | undefined;
  setSelectedBarber: (barber: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  customerDetails: CustomerDetails;
  setCustomerDetails: (details: CustomerDetails) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  handleSubmitBooking: () => void;
  totalPrice: number;
  totalDuration: number;
  submitting: boolean;
  buttonText?: string;
  // Add the missing categories props
  categories?: Category[];
  categoriesLoading?: boolean;
  // Add the onServiceToggle prop to match BookingContainer
  onServiceToggle?: (service: any, skipDiscountCalculation?: boolean) => void;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  selectedServices,
  toggleService,
  selectedDate,
  setSelectedDate,
  branch,
  selectedBarber,
  setSelectedBarber,
  employees,
  employeesLoading,
  selectedTime,
  setSelectedTime,
  customerDetails,
  setCustomerDetails,
  termsAccepted,
  setTermsAccepted,
  handleSubmitBooking,
  totalPrice,
  totalDuration,
  submitting,
  buttonText,
  onServiceToggle
}) => {
  switch (currentStep) {
    case "services":
      return (
        <ServiceStep
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle || toggleService} // Use onServiceToggle if provided, otherwise fallback to toggleService
        />
      );
    case "datetime":
      return (
        <DateTimeStep
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          branch={branch}
        />
      );
    case "barber":
      return (
        <BarberStep
          selectedBarber={selectedBarber}
          onBarberSelect={setSelectedBarber}
          employees={employees}
          employeesLoading={employeesLoading}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedServices={selectedServices}
        />
      );
    case "customer":
      return (
        <CustomerStep
          customerDetails={customerDetails}
          onCustomerDetailsChange={(field, value) => {
            const updatedDetails = { ...customerDetails, [field]: value };
            setCustomerDetails(updatedDetails);
          }}
          branch={branch}
          onTermsAcceptanceChange={setTermsAccepted}
          termsAccepted={termsAccepted}
        />
      );
    case "summary":
      return (
        <SummaryStep
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBarber={employees?.find(emp => emp.id === selectedBarber)}
          customerDetails={customerDetails}
          branch={branch}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          employees={employees}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
