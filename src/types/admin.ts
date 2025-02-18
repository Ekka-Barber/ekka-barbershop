
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
  location: string;
  whatsapp_number: string | null;
}

export interface QRCode {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}
