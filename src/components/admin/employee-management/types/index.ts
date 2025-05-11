
// Re-export all types from document-types
export type { DocumentCalculation, EmployeeDocument } from './document-types';
export { DocumentType, DocumentStatus } from './document-types';

// Define PaginationState type
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// Define Employee type
export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  role: string;
  branch_id?: string;
  is_archived: boolean;
  nationality?: string;
  photo_url?: string;
  email?: string;
  start_date?: string;
  created_at: string;
  updated_at: string;
}

// Define EmployeesTabProps interface
export interface EmployeesTabProps {
  initialBranchId?: string;
}

// Define EmployeeListProps interface
export interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  pagination: PaginationState;
  onEmployeeSelect: (id: string) => void;
  selectedEmployee: string | null;
}

// Create a DocumentContextType
export interface DocumentContextType {
  documents: EmployeeDocument[];
  isLoading: boolean;
  error: Error | null;
  addDocument: (document: Partial<EmployeeDocument>) => Promise<void>;
  updateDocument: (id: string, document: Partial<EmployeeDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  calculateStatus: (document: EmployeeDocument) => DocumentCalculation;
}
