
import { ServiceSelectionContainer } from "./service-selection/ServiceSelectionContainer";
import { ServiceSelectionView } from "./service-selection/ServiceSelectionView";
import { SelectedService } from "@/types/service";

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
  isUpdatingPackage?: boolean;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  isUpdatingPackage,
  handlePackageServiceUpdate
}: ServiceSelectionProps) => {
  const selectionState = ServiceSelectionContainer({
    categories,
    isLoading,
    selectedServices,
    onServiceToggle,
    onStepChange,
    isUpdatingPackage,
    handlePackageServiceUpdate
  });
  
  return (
    <ServiceSelectionView 
      isLoading={isLoading}
      categories={categories}
      selectionState={selectionState}
    />
  );
};
