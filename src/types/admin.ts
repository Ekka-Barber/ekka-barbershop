

// File management types
export interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: 'menu' | 'offers';
  is_active: boolean;
  display_order?: number;
  branch_name?: string;
  branch_id?: string; // Primary relationship field
  is_all_branches?: boolean;
  end_date?: string | null;
  end_time?: string | null;
  created_at?: string;
  file_url?: string;
  // Optional: Add populated branch data for UI
  branch?: {
    id: string;
    name: string;
    name_ar: string;
  };
}

export interface FilePreview {
  url: string;
  type: 'menu' | 'offers';
  fileType: 'image' | 'pdf';
  name: string; // This was missing
}

// Blocked dates types
export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
}

export interface BlockedDateInput {
  date: Date;
  reason: string;
  is_recurring: boolean;
}

// QR Code types
export interface QRCode {
  id: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}
