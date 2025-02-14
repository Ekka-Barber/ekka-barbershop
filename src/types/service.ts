
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

export const validateService = (service: any): Service => {
  // Ensure all required fields are present
  if (!service?.id || !service?.name_en || !service?.name_ar || 
      typeof service?.price !== 'number' || typeof service?.duration !== 'number' ||
      !service?.category_id || typeof service?.display_order !== 'number') {
    throw new Error('Invalid service data');
  }

  return {
    id: service.id,
    name_en: service.name_en,
    name_ar: service.name_ar,
    description_en: service.description_en || null,
    description_ar: service.description_ar || null,
    price: service.price,
    duration: service.duration,
    category_id: service.category_id,
    display_order: service.display_order,
    discount_type: service.discount_type || undefined,
    discount_value: service.discount_value || undefined
  };
};

export type ValidService = ReturnType<typeof validateService>;
