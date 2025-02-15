export interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  duration: number;
  category_id: string;
  display_order: number;
  discount_type?: string;
  discount_value?: number;
}

export interface SelectedService extends Service {
  isUpsellItem?: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  mainServiceId?: string; // Track which main service this upsell depends on
  dependentUpsells?: string[]; // Track which upsells depend on this main service
}

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  services?: Service[];
}

export interface ServiceUpsell {
  id: string;
  main_service_id: string;
  upsell_service_id: string;
  discount_percentage: number;
}

export interface WorkingHours {
  [day: string]: {
    start: string;
    end: string;
  };
}

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

export type ValidService = ReturnType<typeof validateService>;
