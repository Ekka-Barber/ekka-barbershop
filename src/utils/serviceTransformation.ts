
import { Service, SelectedService } from '@/types/service';
import { roundPrice } from './priceFormatting';
import { calculateDiscountedPrice } from './bookingCalculations';

/**
 * Transforms a service into a selected service with calculated prices
 * @param service The original service
 * @param skipDiscountCalculation Whether to skip discount calculation
 * @param isBasePackageService Flag to mark as base package service
 * @returns The transformed selected service
 */
export const transformServiceToSelected = (
  service: Service, 
  skipDiscountCalculation: boolean = false,
  isBasePackageService: boolean = false
): SelectedService => {
  // Ensure service is treated as a valid Service type for calculateDiscountedPrice
  const serviceWithCorrectTypes = {
    ...service,
    discount_type: service.discount_type as "amount" | "percentage"
  };
  
  const finalPrice = skipDiscountCalculation ? service.price : calculateDiscountedPrice({
    ...service,
    discount_type: service.discount_type as "amount" | "percentage"
  });
  
  return {
    ...service,
    price: roundPrice(finalPrice),
    originalPrice: skipDiscountCalculation ? undefined : (finalPrice !== service.price ? roundPrice(service.price) : undefined),
    isUpsellItem: false,
    isBasePackageService: isBasePackageService,
    dependentUpsells: []
  };
};

/**
 * Transforms an upsell service into a selected service
 * @param upsell The upsell service data
 * @param mainServiceId The ID of the main service
 * @returns The transformed upsell service
 */
export const transformUpsellToSelected = (
  upsell: any, 
  mainServiceId: string
): SelectedService => {
  return {
    id: upsell.id,
    name_en: upsell.name_en,
    name_ar: upsell.name_ar,
    price: roundPrice(upsell.discountedPrice),
    duration: upsell.duration,
    category_id: '',
    display_order: 0,
    description_en: null,
    description_ar: null,
    discount_type: null,
    discount_value: null,
    originalPrice: roundPrice(upsell.price),
    discountPercentage: upsell.discountPercentage,
    isUpsellItem: true,
    mainServiceId: mainServiceId
  };
};

/**
 * Transforms service data for display in the UI based on language
 * @param services Array of services to transform
 * @param language Current language ('en' or 'ar')
 * @returns Transformed services with display-ready properties
 */
export const transformServicesForDisplay = (
  services: SelectedService[], 
  language: 'en' | 'ar'
) => {
  return services.map(service => ({
    id: service.id,
    name: language === 'ar' ? service.name_ar : service.name_en,
    price: service.price,
    duration: service.duration,
    originalPrice: service.originalPrice,
    isBasePackageService: service.isBasePackageService,
    isPackageAddOn: service.isPackageAddOn
  }));
};

/**
 * Creates a package SelectedService from a regular Service
 * @param service Original service
 * @param isBaseService Whether this is the base service
 * @param discountPercentage Discount to apply (for add-ons only)
 * @returns Package service with proper flags and pricing
 */
export const createPackageService = (
  service: Service | SelectedService,
  isBaseService: boolean,
  discountPercentage: number = 0
): SelectedService => {
  // Base price calculation - no discount for base service
  const basePrice = 'originalPrice' in service && service.originalPrice ? service.originalPrice : service.price;
  
  // Only apply discount if it's not the base service and discount is provided
  const finalPrice = isBaseService ? 
    basePrice : 
    Math.floor(basePrice * (1 - discountPercentage / 100));
  
  // Ensure we always preserve the truly original price for consistent discounting
  return {
    ...service,
    isBasePackageService: isBaseService,
    isPackageAddOn: !isBaseService,
    isUpsellItem: 'isUpsellItem' in service ? service.isUpsellItem : false,
    price: finalPrice,
    originalPrice: isBaseService ? undefined : basePrice,
    discountPercentage: isBaseService ? undefined : discountPercentage,
    dependentUpsells: 'dependentUpsells' in service ? service.dependentUpsells : []
  };
};
