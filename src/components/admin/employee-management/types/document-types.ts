
import { Database } from '@/types/supabase-generated';

// Document type enum (matches CHECK constraint in database)
export type DocumentTypeEnum = 'health_certificate' | 'residency_permit' | 'work_license' | 'custom';

// Document status enum
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

// Document type from database schema
export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: DocumentTypeEnum;
  document_name: string;
  document_number?: string | null;
  issue_date: string; // ISO date string
  expiry_date: string; // ISO date string
  duration_months: number;
  notification_threshold_days: number;
  document_url?: string | null;
  notes?: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  status?: DocumentStatus; // This will be included in the view but not in the base table
  days_remaining?: number; // This will be included in the view but not in the base table
  employee_name?: string; // This will be included in the view but not in the base table
  branch_id?: string; // This will be included in the view but not in the base table
}

// Document type for document creation/update
export type EmployeeDocumentInput = Omit<EmployeeDocument, 'id' | 'created_at' | 'updated_at' | 'status' | 'days_remaining' | 'employee_name' | 'branch_id'>;

// Document type for API responses
export interface DocumentWithStatus extends EmployeeDocument {
  status: DocumentStatus;
  days_remaining: number;
  employee_name: string;
  branch_id: string;
}

// Document status calculation details
export interface DocumentCalculation {
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  statusText: string;
  expiryDate: Date;
}

// Document service types
export interface DocumentService {
  getDocumentsForEmployee(employeeId: string): Promise<EmployeeDocument[]>;
  createDocument(document: EmployeeDocumentInput): Promise<EmployeeDocument>;
  updateDocument(id: string, document: Partial<EmployeeDocumentInput>): Promise<EmployeeDocument>;
  deleteDocument(id: string): Promise<void>;
  getExpiringDocuments(thresholdDays?: number): Promise<DocumentWithStatus[]>;
  getExpiredDocuments(): Promise<DocumentWithStatus[]>;
}

// Database types
export type DocumentsTable = Database['public']['Tables']['employees']['Row']; // Placeholder, replace with actual table when available
export type DocumentsInsert = Database['public']['Tables']['employees']['Insert']; // Placeholder
export type DocumentsUpdate = Database['public']['Tables']['employees']['Update']; // Placeholder

// View types
export type DocumentsView = DocumentsTable & {
  status: DocumentStatus;
  days_remaining: number;
  employee_name: string;
  branch_id: string;
} 
