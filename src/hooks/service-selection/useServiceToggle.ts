
import { useState, useCallback } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useServiceModification } from './useServiceModification';

export const useServiceToggle = (
  selectedServices: SelectedService[],
  setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>,
  baseServiceId: string,
  packageEnabled: boolean
) => {
  const [isUpdatingPackage, setIsUpdatingPackage] = useState<boolean>(false);

  const { removeService, addService } = useServiceModification(
    selectedServices,
    setSelectedServices,
    baseServiceId,
    packageEnabled,
    isUpdatingPackage
  );

  /**
   * Handles the toggling of a service selection
   */
  const handleServiceToggle = useCallback((service: Service | SelectedService, skipDiscountCalculation: boolean = false) => {
    // Don't process toggles during package updates
    if (isUpdatingPackage) {
      console.log('Ignoring service toggle during package update');
      return;
    }

    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      removeService(service);
    } else {
      addService(service, skipDiscountCalculation);
    }
  }, [isUpdatingPackage, selectedServices, removeService, addService]);

  return {
    handleServiceToggle,
    isUpdatingPackage,
    setIsUpdatingPackage
  };
};
