
import { Service } from '@/types/service';

/**
 * Validates a service object to ensure it has all required fields
 * @param service The service object to validate
 * @returns A valid Service object or null if validation fails
 */
export const validateService = (service: any): Service | null => {
  try {
    // Check if all required fields are present and of correct type
    if (!service?.id || !service?.name_en || !service?.name_ar || 
        typeof service?.price !== 'number' || typeof service?.duration !== 'number' ||
        typeof service?.display_order !== 'number') {
      console.warn('Invalid service data:', service);
      return null;
    }

    return {
      id: service.id,
      name_en: service.name_en,
      name_ar: service.name_ar,
      description_en: service.description_en || null,
      description_ar: service.description_ar || null,
      price: service.price,
      duration: service.duration,
      category_id: service.category_id || '', // Use the parent category's ID if not provided
      display_order: service.display_order,
      discount_type: service.discount_type || undefined,
      discount_value: service.discount_value || undefined
    };
  } catch (error) {
    console.error('Error validating service:', error);
    return null;
  }
};
