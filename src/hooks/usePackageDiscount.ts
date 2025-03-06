
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedService } from '@/types/service';
import { PackageSettings } from '@/types/admin';
import { createPackageService } from '@/utils/serviceTransformation';

// Base service ID
const BASE_SERVICE_ID = 'a3dbfd63-be5d-4465-af99-f25c21d578a0';

export const usePackageDiscount = (
  selectedServices: SelectedService[], 
  forceEnabled: boolean = false
) => {
  const [packageEnabled, setPackageEnabled] = useState(false);
  const [forcePackageEnabled, setForcePackageEnabled] = useState(forceEnabled);
  
  // Fetch package settings
  const { data: packageSettings } = useQuery({
    queryKey: ['package_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_settings')
        .select('*')
        .eq('base_service_id', BASE_SERVICE_ID)
        .single();
        
      if (error) {
        console.error('Error fetching package settings:', error);
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
    }
  });

  // Fetch enabled services with display_order
  const { data: enabledPackageServices } = useQuery({
    queryKey: ['package_available_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_available_services')
        .select('service_id, display_order')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
        
      if (error) {
        console.error('Error fetching package available services:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.service_id,
        display_order: item.display_order
      }));
    }
  });

  // Check if base service is selected
  const hasBaseService = useMemo(() => {
    return selectedServices.some(service => 
      service.id === BASE_SERVICE_ID || service.isBasePackageService
    );
  }, [selectedServices]);

  // Get add-on services
  const addOnServices = useMemo(() => {
    if (!hasBaseService && !forcePackageEnabled) return [];
    return selectedServices.filter(service => 
      service.id !== BASE_SERVICE_ID && 
      !service.isUpsellItem && 
      !service.isBasePackageService
    );
  }, [selectedServices, hasBaseService, forcePackageEnabled]);

  // Calculate discount percentage based on number of add-on services
  const getDiscountPercentage = (count: number): number => {
    if (!packageSettings) return 0;
    
    if (count >= 3) {
      return packageSettings.discountTiers.threeOrMore;
    } else if (count === 2) {
      return packageSettings.discountTiers.twoServices;
    } else if (count === 1) {
      return packageSettings.discountTiers.oneService;
    }
    return 0;
  };

  // Get current discount tier based on add-on count
  const getCurrentDiscountTier = useMemo(() => {
    return getDiscountPercentage(addOnServices.length);
  }, [addOnServices.length, packageSettings]);

  // Apply discounts to services with simplified tier calculation
  const applyPackageDiscounts = (services: SelectedService[]): SelectedService[] => {
    if ((!hasBaseService && !forcePackageEnabled) || !packageSettings) {
      return services;
    }

    const addonCount = addOnServices.length;
    if (addonCount === 0) return services;

    // Use the current discount tier based on the number of add-ons
    const discountPercentage = getCurrentDiscountTier;
    
    console.log(`Applying ${discountPercentage}% discount based on ${addonCount} add-on services`);
    
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
  };

  // Calculate total savings from package discounts
  const calculatePackageSavings = (): number => {
    if (!hasBaseService && !forcePackageEnabled) return 0;
    
    return addOnServices.reduce((total, service) => {
      if (!service.originalPrice) return total;
      return total + (service.originalPrice - service.price);
    }, 0);
  };

  // Track base service selection
  useEffect(() => {
    // Force package mode to stay enabled during updates if forcePackageEnabled is true
    if (forcePackageEnabled) {
      if (!packageEnabled) {
        console.log('Package mode forced enabled during update');
        setPackageEnabled(true);
      }
      return;
    }
    
    // Enable package mode when base service is selected
    if (hasBaseService && !packageEnabled) {
      console.log('Package mode enabled - base service detected');
      setPackageEnabled(true);
    }
    
    // Disable package mode when base service is deselected
    if (!hasBaseService && packageEnabled) {
      console.log('Package mode disabled - base service removed');
      setPackageEnabled(false);
    }
  }, [hasBaseService, packageEnabled, forcePackageEnabled]);

  return {
    BASE_SERVICE_ID,
    packageEnabled,
    packageSettings,
    hasBaseService,
    addOnServices,
    enabledPackageServices,
    applyPackageDiscounts,
    calculatePackageSavings,
    getDiscountPercentage,
    setForcePackageEnabled,
    currentDiscountTier: getCurrentDiscountTier
  };
};
