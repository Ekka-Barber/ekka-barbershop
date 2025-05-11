
import { Employee } from '@/types/employee';

// Define document-related types
export type DocumentTypeEnum = 'health_certificate' | 'residency_permit' | 'work_license' | 'custom';

export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface DocumentCalculation {
  daysRemaining: number;
  status: DocumentStatus;
  statusText: string;
}

export interface EmployeeDocument {
  id?: string;
  employeeId: string;
  documentType: DocumentTypeEnum;
  documentName: string;
  documentNumber?: string;
  issueDate: string;
  expiryDate?: string;
  durationMonths: number;
  notificationThresholdDays: number;
  documentUrl?: string;
  notes?: string;
  status?: DocumentStatus;
}

// Define pagination-related types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

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

// Archive Status Filter type needed for employee management
export type ArchiveStatusFilter = 'active' | 'archived' | 'all';

// All branch-related types are now exported from useBranchManager.ts
