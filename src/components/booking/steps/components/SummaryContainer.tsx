
import React from "react";
import { ServicesSummary } from "@/components/booking/service-selection/ServicesSummary";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SelectedService, Service } from "@/types/service";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";
import { PackageSettings } from "@/types/admin";

interface SummaryContainerProps {
  selectedServices: SelectedService[];
  totalDuration: number;
  totalPrice: number;
  language: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  isFirstStep: boolean;
  packageEnabled?: boolean;
  packageSettings?: PackageSettings;
  availableServices: Service[];
  onAddService: (service: Service) => void;
  isValidating: boolean;
}

export const SummaryContainer: React.FC<SummaryContainerProps> = ({
  selectedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep,
  onPrevStep,
  isFirstStep,
  packageEnabled,
  packageSettings,
  availableServices,
  onAddService,
  isValidating
}) => {
  const transformedServices = transformServicesForDisplay(selectedServices, language as 'en' | 'ar');

  return (
    <ErrorBoundary>
      <ServicesSummary 
        selectedServices={transformedServices} 
        totalDuration={totalDuration} 
        totalPrice={totalPrice} 
        language={language as 'en' | 'ar'} 
        onNextStep={onNextStep} 
        onPrevStep={onPrevStep} 
        isFirstStep={isFirstStep} 
        packageEnabled={packageEnabled}
        packageSettings={packageSettings}
        availableServices={availableServices} 
        onAddService={onAddService}
        isValidating={isValidating}
      />
    </ErrorBoundary>
  );
};
