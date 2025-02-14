
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

export interface ServiceCategory {
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
