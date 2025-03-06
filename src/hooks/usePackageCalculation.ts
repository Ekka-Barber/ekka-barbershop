
import { useMemo } from 'react';
import { Service } from '@/types/service';
import { PackageSettings } from '@/types/admin';

export const usePackageCalculation = (
  selectedAddOns: Service[],
  packageSettings?: PackageSettings,
  baseService: Service | null = null
) => {
  // Calculate discounts based on the number of selected add-ons
  const discountPercentage = useMemo(() => {
    if (!packageSettings) return 0;
    
    const count = selectedAddOns.length;
    if (count >= 3) {
      return packageSettings.discountTiers.threeOrMore;
    } else if (count === 2) {
      return packageSettings.discountTiers.twoServices;
    } else if (count === 1) {
      return packageSettings.discountTiers.oneService;
    }
    return 0;
  }, [selectedAddOns.length, packageSettings]);
  
  // Calculate total price and savings
  const calculations = useMemo(() => {
    // Start with base service if present
    let originalTotal = baseService?.price || 0;
    let discountedTotal = originalTotal;
    
    // Add all selected add-on services
    selectedAddOns.forEach(service => {
      originalTotal += service.price;
      // Apply discount to add-ons
      const discountedPrice = service.price * (1 - discountPercentage / 100);
      discountedTotal += Math.floor(discountedPrice);
    });
    
    return {
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
      discountPercentage
    };
  }, [baseService, selectedAddOns, discountPercentage]);

  return {
    ...calculations,
    discountPercentage
  };
};
