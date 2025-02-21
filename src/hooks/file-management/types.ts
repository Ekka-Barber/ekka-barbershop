
import { FileMetadata, FilePreview } from '@/types/admin';

export interface FileUploadParams {
  file: File;
  category: 'menu' | 'offers';
}

export interface FileToggleParams {
  id: string;
  isActive: boolean;
}

export interface FileEndDateParams {
  id: string;
  endDate: string | null;
}

export interface FileValidationConfig {
  maxSize: number;
  allowedTypes: string[];
}
