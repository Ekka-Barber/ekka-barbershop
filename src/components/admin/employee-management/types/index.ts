
// Re-export document-related types from document-types.ts
export type { 
  DocumentTypeEnum,
  DocumentStatus,
  DocumentCalculation,
  EmployeeDocument,
  EmployeeDocumentDB,
  EmployeeDocumentInput,
  DocumentWithStatus,
  DocumentService
} from './document-types';

// Define Branch re-export from useBranchManager
export type { Branch } from '../hooks/useBranchManager';

// Define employee tab props
export interface EmployeesTabProps {
  initialBranchId?: string | null;
}

// Define document form props
export interface DocumentFormProps {
  document?: Partial<EmployeeDocument>;
  employeeId: string;
  onSubmit: (data: Partial<EmployeeDocument>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Define pagination-related types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Archive Status Filter type needed for employee management
export type ArchiveStatusFilter = 'active' | 'archived' | 'all';
