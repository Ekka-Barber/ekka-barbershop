
import { useState, useCallback } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useServiceModification } from './useServiceModification';
import { logger } from '@/utils/logger';

/**
 * Hook for handling service toggle operations
 * Controls add/remove of services while preventing operations during package updates
 * 
 * @param {SelectedService[]} selectedServices - Currently selected services
 * @param {Function} setSelectedServices - State setter for selected services
 * @param {string} baseServiceId - The ID of the base package service
 * @param {boolean} packageEnabled - Whether package mode is enabled
 * @returns {Object} Service toggle handlers and state
 */
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
   * Prevents toggle operations during package updates
   * 
   * @param {Service | SelectedService} service - The service to toggle
   * @param {boolean} skipDiscountCalculation - Whether to skip discount recalculation
   */
  const handleServiceToggle = useCallback((service: Service | SelectedService, skipDiscountCalculation: boolean = false) => {
    // Don't process toggles during package updates
    if (isUpdatingPackage) {
      logger.info('Service toggle blocked - package update in progress');
      return;
    }

    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      logger.debug(`Removing service: ${service.id}`);
      removeService(service);
    } else {
      logger.debug(`Adding service: ${service.id}`);
      addService(service, skipDiscountCalculation);
    }
  }, [isUpdatingPackage, selectedServices, removeService, addService]);

  return {
    handleServiceToggle,
    isUpdatingPackage,
    setIsUpdatingPackage
  };
};
