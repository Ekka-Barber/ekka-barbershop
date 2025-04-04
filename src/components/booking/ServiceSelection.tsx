
import React from 'react';
import { ServiceSelectionView } from "./service-selection/ServiceSelectionView";
import { SelectedService } from "@/types/service";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useServiceSelectionState } from "@/hooks/useServiceSelectionState";

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
  isUpdatingPackage?: boolean;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
  branchId?: string;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  isUpdatingPackage,
  handlePackageServiceUpdate,
  branchId
}: ServiceSelectionProps) => {
  const selectionState = useServiceSelectionState({
    categories,
    isLoading,
    selectedServices,
    onServiceToggle,
    onStepChange,
    isUpdatingPackage,
    handlePackageServiceUpdate,
    branchId
  });
  
  // Transform selectedServices to have proper 'name' property for displayServices
  const enhancedSelectionState = {
    ...selectionState,
    selectedServices,
    pendingNextStep: Boolean(selectionState.pendingNextStep),
    // Explicitly transform the services to match DisplayService type
    displayServices: selectionState.transformServicesForDisplay(
      selectedServices, 
      selectionState.language === 'ar' ? 'ar' : 'en'
    )
  };
  
  return (
    <ErrorBoundary>
      <ServiceSelectionView 
        isLoading={isLoading}
        categories={categories}
        selectionState={enhancedSelectionState}
      />
    </ErrorBoundary>
  );
};
