import type { UseMutationResult } from '@tanstack/react-query';

// Core file metadata type
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
  is_all_branches?: boolean;
  end_date?: string | null;
  created_at?: string;
  file_url?: string;
}

// Preview for uploaded files
export interface FilePreview {
  url: string;
  type: 'menu' | 'offers';
  fileType: 'image' | 'pdf';
  name: string;
}

// Parameters for file operations
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
  endDate: string | null;
  endTime: string | null;
}

// Config for file validation
export interface FileValidationConfig {
  maxSize: number;
  allowedTypes: string[];
}

// Drop result type for drag and drop operations
export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  };
}

// Props types for end date manager hook
export interface EndDateManagerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  updateEndDateMutation: UseMutationResult<void, unknown, FileEndDateParams, unknown>;
}

// Component props types
export interface FileUploadSectionProps {
  branches: Array<{ id: string; name: string }>;
  isAllBranches: boolean;
  setIsAllBranches: (value: boolean) => void;
  selectedBranch: string | null;
  setSelectedBranch: (value: string | null) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, category: 'menu' | 'offers') => void;
  uploading: boolean;
  filePreview: FilePreview | null;
}

export interface FileListSectionProps {
  category: 'menu' | 'offers';
  files: FileMetadata[];
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<void, unknown, FileToggleParams, unknown>;
  deleteMutation: UseMutationResult<void, unknown, FileMetadata, unknown>;
  handleDragEnd: (result: DropResult) => void;
}

export interface FileListItemProps {
  file: FileMetadata;
  index: number;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<void, unknown, { id: string; isActive: boolean }, unknown>;
  deleteMutation: UseMutationResult<void, unknown, FileMetadata, unknown>;
}

export interface FileEndDateManagerProps {
  file: FileMetadata;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (fileId: string) => void;
  handleRemoveEndDate: (fileId: string) => void;
  dialogOpen?: boolean;
  setDialogOpen?: (open: boolean) => void;
}
