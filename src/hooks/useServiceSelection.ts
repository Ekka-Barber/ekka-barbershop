
import { useState } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useServiceToggle } from './service-selection/useServiceToggle';
import { usePackageServiceUpdate } from './service-selection/usePackageServiceUpdate';
import { usePackageDiscount } from '@/hooks/usePackageDiscount';

/**
 * Hook for managing service selection in the booking flow
 * Coordinates between specialized hooks for toggling, package updates, and discounts
 * 
 * @returns {Object} Selection state and handler functions
 */
export const useServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  
  // Use the package discount hook with simplified discount tier tracking
  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    applyPackageDiscounts,
    setForcePackageEnabled,
    currentDiscountTier
  } = usePackageDiscount(selectedServices);

  // Use the service toggle hook for adding/removing services
  const {
    handleServiceToggle,
    isUpdatingPackage,
    setIsUpdatingPackage
  } = useServiceToggle(selectedServices, setSelectedServices, BASE_SERVICE_ID, packageEnabled);

  // Use the package service update hook for handling package updates
  const {
    handlePackageServiceUpdate,
    handleUpsellServiceAdd
  } = usePackageServiceUpdate(
    selectedServices, 
    setSelectedServices, 
    BASE_SERVICE_ID, 
    setIsUpdatingPackage,
    setForcePackageEnabled
  );

  return {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageServiceUpdate,
    isUpdatingPackage
  };
};
