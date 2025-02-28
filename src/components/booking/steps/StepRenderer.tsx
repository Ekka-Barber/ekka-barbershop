
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
  // Common props shared across all steps
  currentStep: BookingStep;
  branch: any;
  
  // Service step props
  selectedServices: SelectedService[];
  toggleService?: (service: any) => void;
  categories?: Category[];
  categoriesLoading?: boolean;
  onServiceToggle?: (service: any, skipDiscountCalculation?: boolean) => void;
  
  // DateTime step props
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  
  // Barber step props
  selectedBarber: string | undefined;
  setSelectedBarber?: (barber: string) => void;
  onBarberSelect?: (barber: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  
  // Customer step props
  customerDetails: CustomerDetails;
  setCustomerDetails?: (details: CustomerDetails) => void;
  onCustomerDetailsChange?: (field: keyof CustomerDetails, value: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  onTermsAcceptanceChange?: (accepted: boolean) => void;
  
  // SummaryStep props
  handleSubmitBooking?: () => void;
  totalPrice: number;
  totalDuration?: number;
  submitting?: boolean;
  buttonText?: string;
  
  // Additional control props
  onStepChange?: (step: BookingStep) => void;
  branchId?: string;
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
  onBarberSelect,
  employees,
  employeesLoading,
  selectedTime,
  setSelectedTime,
  customerDetails,
  setCustomerDetails,
  onCustomerDetailsChange,
  termsAccepted,
  setTermsAccepted,
  onTermsAcceptanceChange,
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
          onBarberSelect={onBarberSelect || setSelectedBarber}
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
          onCustomerDetailsChange={onCustomerDetailsChange || ((field, value) => {
            if (setCustomerDetails) {
              const updatedDetails = { ...customerDetails, [field]: value };
              setCustomerDetails(updatedDetails);
            }
          })}
          branch={branch}
          onTermsAcceptanceChange={onTermsAcceptanceChange || setTermsAccepted}
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
          totalDuration={totalDuration || selectedServices.reduce((sum, service) => sum + service.duration, 0)}
          employees={employees}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
