
import { useState, useEffect } from 'react';
import { SelectedService } from '@/types/service';
import { useServiceToggle } from './useServiceToggle';
import { usePackageServiceUpdate } from './usePackageServiceUpdate';
import { usePackageDiscount } from '@/hooks/usePackageDiscount';

export const useRefactoredServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  
  // Use the package discount hook with enhanced discount tier tracking
  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    applyPackageDiscounts,
    setForcePackageEnabled,
    currentDiscountTier,
    previousDiscountTier
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

  // Apply package discounts if applicable, with tracking for discount tier transitions
  useEffect(() => {
    if (packageEnabled && selectedServices.length > 0 && !isUpdatingPackage) {
      console.log(`Package enabled with ${selectedServices.length} services. Current tier: ${currentDiscountTier}%, Previous tier: ${previousDiscountTier}%`);
      
      const discountedServices = applyPackageDiscounts(selectedServices);
      
      // Only update if there's actually a change to avoid infinite loops
      const hasChanges = discountedServices.some((s, i) => {
        if (i >= selectedServices.length) return true; // New service added
        
        return s.price !== selectedServices[i]?.price || 
              s.originalPrice !== selectedServices[i]?.originalPrice ||
              s.discountPercentage !== selectedServices[i]?.discountPercentage ||
              s.isPackageAddOn !== selectedServices[i]?.isPackageAddOn;
      });
      
      if (hasChanges) {
        console.log('Updating services with new discount calculations');
        setSelectedServices(discountedServices);
      }
    }
  }, [packageEnabled, selectedServices.length, isUpdatingPackage, currentDiscountTier, previousDiscountTier, applyPackageDiscounts]);

  return {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageServiceUpdate,
    isUpdatingPackage
  };
};
