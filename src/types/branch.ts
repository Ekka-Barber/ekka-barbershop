import { WorkingHours } from './service';

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  whatsapp_number: string;
  google_maps_url: string;
  working_hours?: WorkingHours;
  google_place_id: string;
}
