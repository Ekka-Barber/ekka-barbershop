
import { useMemo, useCallback } from 'react';
import { SelectedService } from '@/types/service';
import { PackageSettings } from '@/types/admin';
import { PackageCalculation, NextTierThreshold } from '@/types/package';
import { logger } from '@/utils/logger';

/**
 * Hook for calculating package discounts and price adjustments
 * 
 * @param selectedServices Array of currently selected services
 * @param addOnServices Array of add-on services (non-base services)
 * @param packageSettings Package configuration settings
 * @param hasBaseService Whether a base service is selected
 * @param forceEnabled Whether package mode is forced enabled
 * @returns Discount calculation methods and results
 */
export const useDiscountCalculation = (
  selectedServices: SelectedService[],
  addOnServices: SelectedService[],
  packageSettings: PackageSettings | null | undefined,
  hasBaseService: boolean,
  forceEnabled: boolean = false
) => {
  // Discount calculation based on current number of add-on services (memoized)
  const getDiscountPercentage = useCallback((count: number): number => {
    if (!packageSettings) return 0;
    
    if (count >= 3) {
      return packageSettings.discountTiers.threeOrMore;
    } else if (count === 2) {
      return packageSettings.discountTiers.twoServices;
    } else if (count === 1) {
      return packageSettings.discountTiers.oneService;
    }
    return 0;
  }, [packageSettings]);

  // Get current discount tier based on add-on count (memoized)
  const currentDiscountTier = useMemo(() => {
    return getDiscountPercentage(addOnServices.length);
  }, [addOnServices.length, getDiscountPercentage]);
  
  // Calculate info needed for the next discount tier (memoized)
  const nextTierThreshold = useMemo((): NextTierThreshold | null => {
    if (!packageSettings || addOnServices.length >= 3) return null;
    
    if (addOnServices.length === 0) {
      return {
        servicesNeeded: 1,
        newPercentage: packageSettings.discountTiers.oneService
      };
    } else if (addOnServices.length === 1) {
      return {
        servicesNeeded: 1,
        newPercentage: packageSettings.discountTiers.twoServices
      };
    } else if (addOnServices.length === 2) {
      return {
        servicesNeeded: 1,
        newPercentage: packageSettings.discountTiers.threeOrMore
      };
    }
    
    return null;
  }, [addOnServices.length, packageSettings]);

  // Apply discounts to services with optimized calculation (memoized)
  const applyPackageDiscounts = useCallback((services: SelectedService[]): SelectedService[] => {
    if ((!hasBaseService && !forceEnabled) || !packageSettings) {
      return services;
    }

    const addonCount = addOnServices.length;
    if (addonCount === 0) return services;

    // Use the current discount tier based on the number of add-ons
    const discountPercentage = currentDiscountTier;
    
    logger.debug(`Applying ${discountPercentage}% discount based on ${addonCount} add-on services`);
    
    return services.map(service => {
      // Skip base service, upsell items, and non-package services
      if (service.id === packageSettings.baseServiceId || 
          service.isUpsellItem || 
          service.isBasePackageService) {
        return service;
      }
      
      // For services with existing discounts, ensure we use the original price
      const originalPrice = service.originalPrice || service.price;
      
      // Apply discount from original price
      const discountedPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
      
      // Create package service with updated discount
      return {
        ...service,
        isPackageAddOn: true,
        price: discountedPrice,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage
      };
    });
  }, [addOnServices.length, currentDiscountTier, forceEnabled, hasBaseService, packageSettings]);

  // Calculate total package metrics (memoized)
  const calculatePackageMetrics = useMemo((): PackageCalculation => {
    if (!hasBaseService && !forceEnabled) {
      return {
        originalTotal: 0,
        discountedTotal: 0,
        savings: 0,
        discountPercentage: 0,
        totalWithBase: 0
      };
    }
    
    const originalTotal = addOnServices.reduce(
      (total, service) => total + (service.originalPrice || service.price), 0
    );
    
    const discountedTotal = addOnServices.reduce(
      (total, service) => total + service.price, 0
    );
    
    const savings = originalTotal - discountedTotal;
    
    const discountPercentage = originalTotal > 0 
      ? Math.round((savings / originalTotal) * 100) 
      : 0;
      
    // Include base service in total if present
    const baseServicePrice = selectedServices.find(
      s => s.isBasePackageService || s.id === packageSettings?.baseServiceId
    )?.price || 0;
    
    const totalWithBase = discountedTotal + baseServicePrice;
    
    return {
      originalTotal,
      discountedTotal,
      savings,
      discountPercentage,
      totalWithBase
    };
  }, [addOnServices, forceEnabled, hasBaseService, selectedServices, packageSettings]);

  // Calculate package savings function
  const calculatePackageSavings = useCallback(() => {
    if (!hasBaseService && !forceEnabled) {
      return 0;
    }
    
    const originalTotal = addOnServices.reduce(
      (total, service) => total + (service.originalPrice || service.price), 0
    );
    
    const discountedTotal = addOnServices.reduce(
      (total, service) => total + service.price, 0
    );
    
    return originalTotal - discountedTotal;
  }, [addOnServices, forceEnabled, hasBaseService]);

  return {
    getDiscountPercentage,
    currentDiscountTier,
    nextTierThreshold,
    applyPackageDiscounts,
    calculatePackageMetrics,
    calculatePackageSavings
  };
};
