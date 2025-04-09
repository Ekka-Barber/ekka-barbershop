
import { useState, useEffect, useMemo } from 'react';
import { SelectedService } from '@/types/service';
import { logger } from '@/utils/logger';

/**
 * Hook to manage the state of package selection and discounts
 * 
 * @param selectedServices Array of currently selected services
 * @param baseServiceId ID of the base service
 * @param forceEnabled Flag to force package mode to be enabled
 * @returns Package state and control methods
 */
export const usePackageState = (
  selectedServices: SelectedService[],
  baseServiceId: string,
  forceEnabled: boolean = false
) => {
  const [packageEnabled, setPackageEnabled] = useState(false);
  const [forcePackageEnabled, setForcePackageEnabled] = useState(forceEnabled);
  
  // Check if base service is selected (memoized)
  const hasBaseService = useMemo(() => {
    return selectedServices.some(service => 
      service.id === baseServiceId || service.isBasePackageService
    );
  }, [selectedServices, baseServiceId]);

  // Get add-on services (memoized)
  const addOnServices = useMemo(() => {
    if (!hasBaseService && !forcePackageEnabled) return [];
    return selectedServices.filter(service => 
      service.id !== baseServiceId && 
      !service.isUpsellItem && 
      !service.isBasePackageService
    );
  }, [selectedServices, hasBaseService, forcePackageEnabled, baseServiceId]);

  // Track base service selection
  useEffect(() => {
    // Force package mode to stay enabled during updates if forcePackageEnabled is true
    if (forcePackageEnabled) {
      if (!packageEnabled) {
        logger.debug('Package mode forced enabled during update');
        setPackageEnabled(true);
      }
      return;
    }
    
    // Enable package mode when base service is selected
    if (hasBaseService && !packageEnabled) {
      logger.debug('Package mode enabled - base service detected');
      setPackageEnabled(true);
    }
    
    // Disable package mode when base service is deselected
    if (!hasBaseService && packageEnabled) {
      logger.debug('Package mode disabled - base service removed');
      setPackageEnabled(false);
    }
  }, [hasBaseService, packageEnabled, forcePackageEnabled]);

  return {
    packageEnabled,
    hasBaseService,
    addOnServices,
    setForcePackageEnabled
  };
};
