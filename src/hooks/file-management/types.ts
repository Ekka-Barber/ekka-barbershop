
import { FileMetadata, FilePreview } from '@/types/admin';

export interface FileUploadParams {
  file: File;
  category: 'menu' | 'offers';
  branchId?: string | null;
  branchName?: string | null;
  isAllBranches?: boolean;
  endDate?: Date | null;
  endTime?: string | null;
}

export interface FileToggleParams {
  id: string;
  isActive: boolean;
}

export interface FileEndDateParams {
  id: string;
  endDate: string | null; // Changed from Date to string to match usage
  endTime: string | null;
}

export interface FileValidationConfig {
  maxSize: number;
  allowedTypes: string[];
}
