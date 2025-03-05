
import { Service, SelectedService, DisplayService } from '@/types/service';
import { roundPrice } from './priceFormatting';
import { calculateDiscountedPrice } from './bookingCalculations';

/**
 * Transforms a service into a selected service with calculated prices
 * @param service The original service
 * @param skipDiscountCalculation Whether to skip discount calculation
 * @returns The transformed selected service
 */
export const transformServiceToSelected = (
  service: Service, 
  skipDiscountCalculation: boolean = false
): SelectedService => {
  const finalPrice = skipDiscountCalculation ? service.price : calculateDiscountedPrice(service);
  
  return {
    ...service,
    price: roundPrice(finalPrice),
    originalPrice: skipDiscountCalculation ? undefined : (finalPrice !== service.price ? roundPrice(service.price) : undefined),
    isUpsellItem: false,
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
): DisplayService[] => {
  return services.map(service => ({
    id: service.id,
    name: language === 'ar' ? service.name_ar : service.name_en,
    price: service.price,
    duration: service.duration,
    originalPrice: service.originalPrice
  }));
};

/**
 * Gets barber name based on selected barber ID and employee list
 * @param employees List of employees
 * @param selectedBarber Selected barber ID 
 * @param language Current language ('en' or 'ar')
 * @returns Barber name in the selected language or undefined if not found
 */
export const getBarberNameById = (
  employees: any[] | undefined,
  selectedBarber: string | undefined,
  language: 'en' | 'ar'
): string | undefined => {
  if (!employees || !selectedBarber) return undefined;
  
  const employee = employees.find(emp => emp.id === selectedBarber);
  return employee ? (language === 'ar' ? employee.name_ar : employee.name_en) : undefined;
};

/**
 * Creates service object from a selected service for service toggle handling
 * @param selectedService The selected service to convert back to a regular service
 * @returns Service object with minimal required properties
 */
export const createServiceFromSelected = (selectedService: SelectedService): Service => {
  return {
    id: selectedService.id,
    category_id: selectedService.category_id,
    name_en: selectedService.name_en,
    name_ar: selectedService.name_ar,
    description_en: selectedService.description_en,
    description_ar: selectedService.description_ar,
    price: selectedService.originalPrice || selectedService.price,
    duration: selectedService.duration,
    display_order: selectedService.display_order,
    discount_type: selectedService.discount_type,
    discount_value: selectedService.discount_value
  };
};
