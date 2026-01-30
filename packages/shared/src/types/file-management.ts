import { UseMutationResult } from '@tanstack/react-query';

// Core file metadata type - matches exact database schema from Supabase MCP
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
  end_date: string | null;
  start_date: string | null;
  branch_id: string | null; // Foreign key to branches.id
  created_at: string;
  updated_at: string;
  file_url?: string;
  is_all_branches?: boolean; // UI flag for files applicable to all branches
  // Optional: Add populated branch data for UI
  branch?: {
    id: string;
    name: string;
    name_ar: string;
  };
}

export interface FileEndDateParams {
  id: string;
  endDate: string | null;
  endTime: string | null;
}

// Props types for end date manager hook
export interface EndDateManagerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  updateEndDateMutation: UseMutationResult<void, unknown, FileEndDateParams, unknown>;
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
