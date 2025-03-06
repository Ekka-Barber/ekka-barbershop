
import { useMemo } from 'react';
import { Service } from '@/types/service';
import { PackageSettings } from '@/types/admin';

export function usePackageCalculation(
  selectedAddOns: Service[],
  packageSettings?: PackageSettings,
  baseService: Service | null = null
) {
  // Calculate all package-related values in one go to avoid repeated calculations
  const calculations = useMemo(() => {
    // Default values
    const result = {
      originalTotal: 0,
      discountedTotal: 0,
      savings: 0,
      discountPercentage: 0,
      totalWithBase: 0
    };
    
    // If no package settings or no base service, return defaults
    if (!packageSettings || !baseService) {
      return result;
    }
    
    // Include base service price in original total
    const basePrice = baseService.price;
    result.originalTotal = basePrice;
    result.totalWithBase = basePrice;
    
    // Calculate discount percentage based on add-on count
    if (selectedAddOns.length >= 3) {
      result.discountPercentage = packageSettings.discountTiers.threeOrMore;
    } else if (selectedAddOns.length === 2) {
      result.discountPercentage = packageSettings.discountTiers.twoServices;
    } else if (selectedAddOns.length === 1) {
      result.discountPercentage = packageSettings.discountTiers.oneService;
    }
    
    // Calculate add-on prices
    if (selectedAddOns.length > 0) {
      // Sum original add-on prices
      const addOnTotal = selectedAddOns.reduce((total, service) => total + service.price, 0);
      result.originalTotal += addOnTotal;
      
      // Apply discount to add-ons
      if (result.discountPercentage > 0) {
        const discountMultiplier = 1 - result.discountPercentage / 100;
        const discountedAddOnTotal = Math.floor(addOnTotal * discountMultiplier);
        result.discountedTotal = basePrice + discountedAddOnTotal;
        result.savings = result.originalTotal - result.discountedTotal;
      } else {
        result.discountedTotal = result.originalTotal;
      }
    } else {
      // No add-ons, just base service price
      result.discountedTotal = basePrice;
    }
    
    return result;
  }, [selectedAddOns, packageSettings, baseService]);

  return calculations;
}
