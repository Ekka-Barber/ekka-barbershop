
import { Json } from './supabase-generated';

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

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  display_order?: number;
  services?: Service[];
}

export interface SelectedService extends Service {
  isBasePackageService?: boolean;
  isPackageAddOn?: boolean;
  isUpsellItem?: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  mainServiceId?: string;
  dependentUpsells?: string[];
}

export type WorkingHours = Record<string, string[] | { start: string; end: string }>;

export interface PackageSettings {
  id: string;
  discount_one_service: number;
  discount_two_services: number;
  discount_three_plus_services: number;
  base_service_id: string;
  max_services?: number;
  created_at?: string;
  updated_at?: string;
}
