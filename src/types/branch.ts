import { WorkingHours } from './service';
import { Json } from './supabase';

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  whatsapp_number: string;
  google_maps_url: string;
  working_hours?: WorkingHours | Json;
  google_place_id: string;
  created_at?: string;
  updated_at?: string;
  google_places_api_key?: string;
}
