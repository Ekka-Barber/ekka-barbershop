
export interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  description_en?: string;
  description_ar?: string;
  category_id: string;
  display_order: number;
  mobile_display_order?: number;
  discount_type?: string;
  discount_value?: number;
}

export type WorkingHours = Record<string, string[] | { start: string; end: string }>;
