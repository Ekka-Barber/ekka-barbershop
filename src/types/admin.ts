
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

export interface FileUploadResponse {
  filePath: string;
  error?: string;
}

export interface FileDeleteResponse {
  success: boolean;
  error?: string;
}

export interface FileOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface FilePreview {
  url: string;
  type: 'menu' | 'offers';
  fileType: 'image' | 'pdf';
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedDateInput {
  date: Date;
  reason?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
}
