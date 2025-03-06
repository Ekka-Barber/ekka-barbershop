import { useState, useEffect, useCallback, useMemo } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { transformServiceToSelected, transformUpsellToSelected, createPackageService } from '@/utils/serviceTransformation';
import { usePackageDiscount } from '@/hooks/usePackageDiscount';

export const useServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isUpdatingPackage, setIsUpdatingPackage] = useState<boolean>(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Use the package discount hook with simplified discount tier calculation
  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    applyPackageDiscounts,
    setForcePackageEnabled,
    currentDiscountTier
  } = usePackageDiscount(selectedServices, isUpdatingPackage);

  /**
   * Removes a service from the selected services
   */
  const removeService = useCallback((service: Service | SelectedService) => {
    const hasUpsells = selectedServices.some(s => s.mainServiceId === service.id);
    
    if (hasUpsells) {
      toast({
        title: language === 'ar' ? 'تنبيه' : 'Warning',
        description: language === 'ar' 
          ? 'سيؤدي إزالة هذه الخدمة إلى إزالة الخدمات الإضافية المخفضة المرتبطة بها'
          : 'Removing this service will also remove its discounted add-on services',
        variant: "destructive"
      });
      
      setSelectedServices(prev => prev.filter(s => 
        s.id !== service.id && s.mainServiceId !== service.id
      ));
    } else {
      // If removing the base package service, confirm with the user
      if (service.id === BASE_SERVICE_ID && packageEnabled) {
        const hasPackageServices = selectedServices.some(s => 
          s.id !== BASE_SERVICE_ID && !s.isUpsellItem
        );
        
        if (hasPackageServices) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'إزالة الخدمة الأساسية ستؤدي إلى فقدان خصومات الباقة'
              : 'Removing the base service will remove package discounts',
            variant: "destructive"
          });
          
          // When removing the base service, we also need to remove discounts from add-on services
          setSelectedServices(prev => {
            const updatedServices = prev.filter(s => s.id !== service.id).map(s => {
              // Reset prices for package add-ons
              if (s.isPackageAddOn && s.originalPrice) {
                return {
                  ...s,
                  price: s.originalPrice,
                  isPackageAddOn: false,
                  discountPercentage: 0
                };
              }
              return s;
            });
            
            return updatedServices;
          });
          return;
        }
      }
      
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    }
  }, [selectedServices, BASE_SERVICE_ID, packageEnabled, language, toast]);

  /**
   * Adds a service to the selected services
   */
  const addService = useCallback((service: Service | SelectedService, skipDiscountCalculation: boolean = false) => {
    // Check if trying to add the base service when other services are already selected
    if (service.id === BASE_SERVICE_ID) {
      const hasOtherNonUpsellServices = selectedServices.some(s => 
        !s.isUpsellItem && s.id !== BASE_SERVICE_ID
      );
      
      if (hasOtherNonUpsellServices) {
        toast({
          title: language === 'ar' ? 'غير مسموح' : 'Not Allowed',
          description: language === 'ar' 
            ? 'يجب إختيار خدمة الباقة الأساسية أولاً قبل إضافة خدمات أخرى'
            : 'You must select the base package service first before adding other services',
          variant: "destructive"
        });
        return;
      }
    }
    
    // Check if it's a package service (has package-specific properties)
    if ('isBasePackageService' in service || 'isPackageAddOn' in service) {
      console.log('Adding pre-configured package service:', service.id, service.isBasePackageService ? 'BASE' : 'ADD-ON');
      setSelectedServices(prev => [...prev, service as SelectedService]);
      return;
    }
    
    // Check if it's already a SelectedService with discount info
    if ('originalPrice' in service || 'discountPercentage' in service) {
      // It's already a SelectedService with discount info, add it as is
      setSelectedServices(prev => [...prev, service as SelectedService]);
    } else {
      // Determine if this is the base package service
      const isBasePackageService = service.id === BASE_SERVICE_ID;
      
      // Transform the regular Service into a SelectedService
      const transformedService = transformServiceToSelected(
        service as Service, 
        skipDiscountCalculation,
        isBasePackageService
      );
      
      console.log('Adding transformed service:', transformedService.id, 
        isBasePackageService ? '(base service)' : '');
      
      // Add the service to the selection
      setSelectedServices(prev => {
        const newServices = [...prev, transformedService];
        return newServices;
      });
    }
  }, [BASE_SERVICE_ID, selectedServices, language, toast]);

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

  /**
   * Adds upsell services to the selected services
   */
  const handleUpsellServiceAdd = useCallback((upsellServices: any[]) => {
    upsellServices.forEach(upsell => {
      const mainService = selectedServices.find(s => !s.isUpsellItem && s.id === upsell.mainServiceId);
      
      if (!mainService) {
        console.error('Main service not found for upsell:', upsell);
        return;
      }

      setSelectedServices(prev => {
        const newUpsell = transformUpsellToSelected(upsell, mainService.id);

        const updatedServices = prev.map(s => {
          if (s.id === mainService.id) {
            return {
              ...s,
              dependentUpsells: [...(s.dependentUpsells || []), upsell.id]
            };
          }
          return s;
        });

        return [...updatedServices, newUpsell];
      });
    });
  }, [selectedServices]);

  /**
   * Safely update package services without removing the base service temporarily
   */
  const handlePackageServiceUpdate = useCallback((packageServices: SelectedService[]) => {
    try {
      if (!packageServices.length) {
        console.error('No package services provided for update');
        return;
      }

      // Set flag to prevent disabling package mode during update
      setIsUpdatingPackage(true);
      setForcePackageEnabled(true);
      
      console.log('🔄 Starting package update with', packageServices.length, 'services');
      
      // Validate that we have a base service in the package
      const baseService = packageServices.find(s => s.isBasePackageService || s.id === BASE_SERVICE_ID);
      if (!baseService) {
        throw new Error('No base service found in package services');
      }
      
      // Extract existing upsell items to preserve them
      const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
      
      // Update selected services in a single state update to prevent flickering
      setSelectedServices(prevServices => {
        // First, remove all non-upsell services
        const withoutNonUpsells = prevServices.filter(s => s.isUpsellItem);
        
        // Add the base service first (VERY IMPORTANT)
        const withBaseService = [...withoutNonUpsells, baseService];
        
        // Then add all other package services
        const otherPackageServices = packageServices.filter(s => 
          !s.isBasePackageService && s.id !== BASE_SERVICE_ID
        );
        
        return [...withBaseService, ...otherPackageServices];
      });

      console.log('✅ Package services updated successfully');
    } catch (error) {
      console.error('Error updating package services:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء تحديث الباقة'
          : 'An error occurred while updating the package',
        variant: "destructive"
      });
    } finally {
      // Reset flags after a short delay to ensure state has settled
      setTimeout(() => {
        setIsUpdatingPackage(false);
        setForcePackageEnabled(false);
      }, 500);
    }
  }, [BASE_SERVICE_ID, selectedServices, language, toast, setForcePackageEnabled]);

  // Apply package discounts if applicable, with simplified tier calculation
  useEffect(() => {
    if (packageEnabled && selectedServices.length > 0 && !isUpdatingPackage) {
      console.log(`Package enabled with ${selectedServices.length} services. Current tier: ${currentDiscountTier}%`);
      
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
  }, [packageEnabled, selectedServices.length, isUpdatingPackage, currentDiscountTier, applyPackageDiscounts]);

  return {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageServiceUpdate,
    isUpdatingPackage
  };
};
