
import { SelectedService } from '@/types/service';
import { usePackageConfig } from './package-discount/usePackageConfig';
import { usePackageState } from './package-discount/usePackageState';
import { useDiscountCalculation } from './package-discount/useDiscountCalculation';

// Re-export BASE_SERVICE_ID for backward compatibility
export { BASE_SERVICE_ID } from './package-discount/usePackageConfig';

/**
 * Main hook for package discount management
 * Coordinates between specialized hooks for different aspects of package discount functionality
 *
 * @param selectedServices Array of currently selected services
 * @param forceEnabled Flag to force package mode to be enabled
 * @returns Complete package discount state and utility functions
 */
export const usePackageDiscount = (
  selectedServices: SelectedService[], 
  forceEnabled: boolean = false
) => {
  // Use our specialized hooks for cleaner code organization
  const { BASE_SERVICE_ID, packageSettings, enabledPackageServices } = usePackageConfig();
  
  const { 
    packageEnabled, 
    hasBaseService, 
    addOnServices,
    setForcePackageEnabled 
  } = usePackageState(selectedServices, BASE_SERVICE_ID, forceEnabled);
  
  const { 
    getDiscountPercentage,
    currentDiscountTier,
    nextTierThreshold,
    applyPackageDiscounts,
    calculatePackageMetrics,
    calculatePackageSavings 
  } = useDiscountCalculation(
    selectedServices, 
    addOnServices, 
    packageSettings,
    hasBaseService,
    forceEnabled
  );

  return {
    // Re-export everything from our specialized hooks
    // Core package state
    BASE_SERVICE_ID,
    packageEnabled,
    packageSettings,
    hasBaseService,
    
    // Related services
    addOnServices,
    enabledPackageServices,
    
    // Discount management and utilities
    applyPackageDiscounts,
    calculatePackageMetrics,
    calculatePackageSavings,
    getDiscountPercentage,
    setForcePackageEnabled,
    
    // Current discount information
    currentDiscountTier,
    nextTierThreshold
  };
};
