
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ServicesSummary } from "../../service-selection/ServicesSummary";
import { PackageSettings } from "@/types/admin";
import { Service, SelectedService } from "@/types/service";

interface ServiceSummaryWrapperProps {
  transformedServices: SelectedService[];
  totalDuration: number;
  totalPrice: number;
  language: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  currentStepIndex: number;
  packageEnabled?: boolean;
  packageSettings?: PackageSettings;
  handleServiceToggle: (service: Service) => void;
  categories?: any[];
  isValidating: boolean;
}

export const ServiceSummaryWrapper = ({
  transformedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep,
  onPrevStep,
  currentStepIndex,
  packageEnabled,
  packageSettings,
  handleServiceToggle,
  categories,
  isValidating
}: ServiceSummaryWrapperProps) => {
  // Calculate available services for add-on
  const availableServices = categories
    ? categories.flatMap(c => c.services).filter(s => 
        s.id !== packageSettings?.baseServiceId && 
        !transformedServices.some(ts => ts.id === s.id))
    : [];

  return (
    <ErrorBoundary>
      <ServicesSummary 
        selectedServices={transformedServices} 
        totalDuration={totalDuration} 
        totalPrice={totalPrice} 
        language={language} 
        onNextStep={onNextStep} 
        onPrevStep={onPrevStep} 
        isFirstStep={currentStepIndex === 0} 
        packageEnabled={packageEnabled}
        packageSettings={packageSettings}
        availableServices={availableServices} 
        onAddService={(service) => handleServiceToggle(service)}
        isValidating={isValidating}
      />
    </ErrorBoundary>
  );
};
