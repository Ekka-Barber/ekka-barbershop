
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedService } from '@/types/service';
import { PackageSettings } from '@/types/admin';
import { logger } from '@/utils/logger';
import { PackageCalculation, NextTierThreshold } from '@/types/package';

// Base service ID - export it so it can be imported elsewhere
export const BASE_SERVICE_ID = 'a3dbfd63-be5d-4465-af99-f25c21d578a0';

export const usePackageDiscount = (
  selectedServices: SelectedService[], 
  forceEnabled: boolean = false
) => {
  const [packageEnabled, setPackageEnabled] = useState(false);
  const [forcePackageEnabled, setForcePackageEnabled] = useState(forceEnabled);
  
  // Fetch package settings with proper caching
  const { data: packageSettings } = useQuery({
    queryKey: ['package_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_settings')
        .select('*')
        .eq('base_service_id', BASE_SERVICE_ID)
        .single();
        
      if (error) {
        logger.error('Error fetching package settings:', error);
        return null;
      }
      
      return {
        baseServiceId: data.base_service_id,
        discountTiers: {
          oneService: data.discount_one_service,
          twoServices: data.discount_two_services,
          threeOrMore: data.discount_three_plus_services
        },
        maxServices: data.max_services
      } as PackageSettings;
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Fetch enabled services with display_order, optimized with caching
  const { data: enabledPackageServices } = useQuery({
    queryKey: ['package_available_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_available_services')
        .select('service_id, display_order')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
        
      if (error) {
        logger.error('Error fetching package available services:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.service_id,
        display_order: item.display_order
      }));
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Check if base service is selected (memoized)
  const hasBaseService = useMemo(() => {
    return selectedServices.some(service => 
      service.id === BASE_SERVICE_ID || service.isBasePackageService
    );
  }, [selectedServices]);

  // Get add-on services (memoized)
  const addOnServices = useMemo(() => {
    if (!hasBaseService && !forcePackageEnabled) return [];
    return selectedServices.filter(service => 
      service.id !== BASE_SERVICE_ID && 
      !service.isUpsellItem && 
      !service.isBasePackageService
    );
  }, [selectedServices, hasBaseService, forcePackageEnabled]);

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
    if ((!hasBaseService && !forcePackageEnabled) || !packageSettings) {
      return services;
    }

    const addonCount = addOnServices.length;
    if (addonCount === 0) return services;

    // Use the current discount tier based on the number of add-ons
    const discountPercentage = currentDiscountTier;
    
    logger.debug(`Applying ${discountPercentage}% discount based on ${addonCount} add-on services`);
    
    return services.map(service => {
      // Skip base service, upsell items, and non-package services
      if (service.id === BASE_SERVICE_ID || 
          service.isUpsellItem || 
          service.isBasePackageService) {
        return service;
      }
      
      // Check if service is in the enabled package services list
      if (enabledPackageServices && 
          !enabledPackageServices.some(s => s.id === service.id)) {
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
  }, [addOnServices.length, currentDiscountTier, enabledPackageServices, forcePackageEnabled, hasBaseService, packageSettings]);

  // Calculate total package metrics (memoized)
  const calculatePackageMetrics = useMemo((): PackageCalculation => {
    if (!hasBaseService && !forcePackageEnabled) {
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
      s => s.isBasePackageService || s.id === BASE_SERVICE_ID
    )?.price || 0;
    
    const totalWithBase = discountedTotal + baseServicePrice;
    
    return {
      originalTotal,
      discountedTotal,
      savings,
      discountPercentage,
      totalWithBase
    };
  }, [addOnServices, forcePackageEnabled, hasBaseService, selectedServices]);

  // Calculate package savings function
  const calculatePackageSavings = useCallback(() => {
    if (!hasBaseService && !forcePackageEnabled) {
      return 0;
    }
    
    const originalTotal = addOnServices.reduce(
      (total, service) => total + (service.originalPrice || service.price), 0
    );
    
    const discountedTotal = addOnServices.reduce(
      (total, service) => total + service.price, 0
    );
    
    return originalTotal - discountedTotal;
  }, [addOnServices, forcePackageEnabled, hasBaseService]);

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
