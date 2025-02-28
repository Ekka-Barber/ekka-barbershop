
import { useState } from "react";
import { ServiceSelectionContainer } from "../service-selection/ServiceSelectionContainer";
import { useServiceAvailability } from "@/hooks/useServiceAvailability";
import { BookingStep } from "../BookingProgress";
import { SelectedService, Category, Service } from "@/types/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceStepProps {
  categories: Category[];
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: Service) => void;
  onStepChange: (step: BookingStep) => void;
  branchId?: string;
}

const ServiceStep: React.FC<ServiceStepProps> = ({
  categories,
  categoriesLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId
}) => {
  const { language } = useLanguage();
  const { getServiceAvailability } = useServiceAvailability(branchId);
  const [totalDuration, setTotalDuration] = useState(
    selectedServices.reduce((sum, service) => sum + service.duration, 0)
  );
  const [totalPrice, setTotalPrice] = useState(
    selectedServices.reduce((sum, service) => sum + service.price, 0)
  );

  // Update totals when services change
  useState(() => {
    setTotalDuration(selectedServices.reduce((sum, service) => sum + service.duration, 0));
    setTotalPrice(selectedServices.reduce((sum, service) => sum + service.price, 0));
  });

  const isServiceAvailable = (serviceId: string): boolean => {
    return getServiceAvailability(serviceId);
  };

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <ServiceSelectionContainer
      categories={categories}
      selectedServices={selectedServices}
      onServiceToggle={onServiceToggle}
      onNextStep={onStepChange}
      isServiceAvailable={isServiceAvailable}
      language={language}
      totalDuration={totalDuration}
      totalPrice={totalPrice}
    />
  );
};

export default ServiceStep;
