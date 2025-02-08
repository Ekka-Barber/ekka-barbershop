
export type Category = {
  id: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  services: Service[];
};

export type Service = {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  duration: number;
  price: number;
  display_order: number;
  discount_type: string | null;
  discount_value: number | null;
};

export type SelectedService = {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
  isUpsellItem?: boolean;
};

export type ValidService = Omit<Service, 'discount_type'> & {
  discount_type: 'percentage' | 'amount' | null;
};

export type WorkingHours = {
  [key: string]: string[];
};

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const isValidDiscountType = (type: string | null): type is 'percentage' | 'amount' | null => {
  return type === null || type === 'percentage' || type === 'amount';
};

export const validateService = (service: Service): ValidService => {
  if (service.discount_type && !isValidDiscountType(service.discount_type)) {
    console.warn(`Invalid discount_type: ${service.discount_type}, setting to null`);
    return { ...service, discount_type: null };
  }
  return service as ValidService;
};

