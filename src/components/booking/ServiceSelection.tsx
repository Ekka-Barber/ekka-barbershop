
import { ServiceSelectionContainer } from "./service-selection/ServiceSelectionContainer";
import { ServiceSelectionView } from "./service-selection/ServiceSelectionView";
import { SelectedService } from "@/types/service";

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceSelectionProps) => {
  const selectionState = ServiceSelectionContainer({
    categories,
    isLoading,
    selectedServices,
    onServiceToggle,
    onStepChange
  });
  
  return (
    <ServiceSelectionView 
      isLoading={isLoading}
      categories={categories}
      selectionState={selectionState}
    />
  );
};
