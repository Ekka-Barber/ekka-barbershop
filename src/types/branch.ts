import { WorkingHours } from './service';
import { Json } from './supabase';

export interface Branch {
  id: string;
  name: string;
  name_ar: string | null;
  address: string | null;
  address_ar: string | null;
  is_main: boolean | null;
  whatsapp_number: string | null;
  google_maps_url: string | null;
  working_hours?: WorkingHours | Json;
  google_place_id: string | null;
  created_at?: string;
  updated_at?: string;
  google_places_api_key?: string | null;
}
