export interface Branch {
  id: string;
  name: string;
  name_ar: string | null;
  address: string | null;
  address_ar: string | null;
  is_main: boolean | null;
  whatsapp_number: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  created_at?: string;
  updated_at?: string;
  google_places_api_key?: string | null;
}

export interface BranchFormData {
  name: string;
  name_ar?: string;
  address?: string;
  address_ar?: string;
  google_maps_url?: string;
  google_place_id?: string;
  google_places_api_key?: string;
  whatsapp_number?: string;
  is_main?: boolean;
}
