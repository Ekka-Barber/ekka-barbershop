
export interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: 'menu' | 'offers';
  is_active: boolean;
  branch_name: string | null;
  end_date: string | null;
  created_at: string;
  display_order: number;
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  location: string;
  whatsapp_number: string;
  is_main: boolean;
  google_maps_url: string;
  working_hours: any;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}
