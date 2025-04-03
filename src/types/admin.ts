
// Package settings types
export interface PackageSettings {
  baseServiceId: string;
  discountTiers: {
    oneService: number;
    twoServices: number;
    threeOrMore: number;
  };
  maxServices: number | null;
}

export interface PackageServiceToggle {
  serviceId: string;
  enabled: boolean;
}

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
  branch_id?: string;
  end_date?: string | null;
  created_at?: string;
}

export interface FilePreview {
  url: string;
  type: 'menu' | 'offers';
  fileType: 'image' | 'pdf';
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
