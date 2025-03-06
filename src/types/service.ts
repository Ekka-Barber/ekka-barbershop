
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
  isBasePackageService?: boolean; // New flag to identify base service
  isPackageAddOn?: boolean; // New flag to identify package add-ons
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
  created_at: string;  // Added this field
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

export type ValidService = Service | null;
