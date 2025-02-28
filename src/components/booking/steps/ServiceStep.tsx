
import { ServiceSelectionContainer } from "../service-selection/ServiceSelectionContainer";
import { BookingStep } from "../BookingProgress";
import { SelectedService } from "@/types/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceStepProps {
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: BookingStep) => void;
  branchId?: string;
  categories?: any[];
  categoriesLoading?: boolean;
  totalPrice?: number;
  totalDuration?: number;
}

const ServiceStep: React.FC<ServiceStepProps> = ({
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId,
  categories,
  categoriesLoading,
  totalPrice,
  totalDuration
}) => {
  const { language } = useLanguage();
  
  // Calculate total duration and price from selected services if not provided as props
  const calculatedTotalDuration = totalDuration || selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const calculatedTotalPrice = totalPrice || selectedServices.reduce((sum, service) => sum + service.price, 0);

  // Check if we're still loading categories
  if (categoriesLoading || !categories) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  // Helper function to check if a service is selected
  const isServiceSelected = (serviceId: string): boolean => {
    return selectedServices.some(service => service.id === serviceId);
  };

  return (
    <div className="h-[calc(100vh-16rem)]">
      <ServiceSelectionContainer
        categories={categories}
        selectedServices={selectedServices}
        onServiceToggle={onServiceToggle}
        onNextStep={(step) => onStepChange?.(step)}
        isServiceAvailable={() => true} // Services are pre-filtered by availability in useBookingServices
        language={language}
        totalDuration={calculatedTotalDuration}
        totalPrice={calculatedTotalPrice}
      />
    </div>
  );
};

export default ServiceStep;
