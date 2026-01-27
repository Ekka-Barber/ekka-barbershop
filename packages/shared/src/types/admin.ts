

// File management types - matches exact database schema from Supabase MCP
export interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  category: string; // Database returns string, not literal types
  is_active: boolean | null;
  display_order: number | null;
  branch_name: string | null;
  branch_name_ar: string | null;
  is_all_branches?: boolean;
  end_date: string | null;
  start_date: string | null;
  branch_id: string | null; // Foreign key to branches.id
  created_at: string;
  updated_at: string;
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
