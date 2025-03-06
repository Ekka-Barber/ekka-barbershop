
import React, { useMemo } from 'react';
import { ServiceSelectionContainer } from "./service-selection/ServiceSelectionContainer";
import { ServiceSelectionView } from "./service-selection/ServiceSelectionView";
import { SelectedService } from "@/types/service";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

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
  // Memoize the service selection state to prevent unnecessary recalculations
  const selectionState = useMemo(() => {
    return ServiceSelectionContainer({
      categories,
      isLoading,
      selectedServices,
      onServiceToggle,
      onStepChange,
      isUpdatingPackage,
      handlePackageServiceUpdate
    });
  }, [
    categories, 
    isLoading, 
    selectedServices, 
    onServiceToggle, 
    onStepChange, 
    isUpdatingPackage, 
    handlePackageServiceUpdate
  ]);
  
  return (
    <ErrorBoundary>
      <ServiceSelectionView 
        isLoading={isLoading}
        categories={categories}
        selectionState={selectionState}
      />
    </ErrorBoundary>
  );
};
