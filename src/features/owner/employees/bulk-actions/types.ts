import type { EmployeeDocumentWithStatus } from '@/features/owner/employees/types';

export interface BulkActionsProps {
  selectedDocuments: string[];
  documents: EmployeeDocumentWithStatus[];
  onBulkEdit: (
    documentIds: string[],
    updates: Partial<EmployeeDocumentWithStatus>
  ) => Promise<void>;
  onBulkDelete: (documentIds: string[]) => Promise<void>;
  onBulkStatusUpdate: (
    documentIds: string[],
    status: string,
    notes?: string
  ) => Promise<void>;
  onClearSelection: () => void;
  onToggleSelectAll: (documents: EmployeeDocumentWithStatus[]) => void;
  isAllSelected: boolean;
  isLoading?: boolean;
}

export interface BulkEditFormData {
  notification_threshold_days?: number;
  notes?: string;
  action: 'update_notifications' | 'add_notes' | 'replace_notes';
}

export interface StatusOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface StatusStats {
  [status: string]: number;
}

export type BulkActionType = 'edit' | 'status' | 'delete';

export interface BulkOperationState {
  showDeleteDialog: boolean;
  showEditDialog: boolean;
  showStatusDialog: boolean;
  selectedStatus: string;
  editFormData: BulkEditFormData;
  statusNotes: string;
}
