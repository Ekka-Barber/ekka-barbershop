export type Category = {
  id: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  services: Service[];  // Changed from optional to required
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
  discount_type: "percentage" | "amount" | null;
  discount_value: number | null;
};