
// Document types
export enum DocumentType {
  PASSPORT = 'passport',
  ID_CARD = 'id_card',
  DRIVING_LICENSE = 'driving_license',
  WORK_PERMIT = 'work_permit',
  RESIDENCE_PERMIT = 'residence_permit',
  INSURANCE = 'insurance',
  CONTRACT = 'contract',
  HEALTH_CERTIFICATE = 'health_certificate',
  RESIDENCY_PERMIT = 'residency_permit',
  WORK_LICENSE = 'work_license',
  CUSTOM = 'custom',
  OTHER = 'other',
}

// Document status
export enum DocumentStatus {
  VALID = 'valid',
  WARNING = 'expiring_soon',
  EXPIRED = 'expired',
}

// Document calculation result
export interface DocumentCalculation {
  daysRemaining: number | null;
  isExpired: boolean;
  isWarning: boolean;
  statusText?: string;
  expiryDate?: Date;
}

// Employee document
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  issueDate: string;
  expiryDate: string;
  durationMonths: number;
  notificationThresholdDays: number;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status?: DocumentStatus;
  days_remaining?: number;
}

// Document with calculated status
export interface DocumentWithStatus extends EmployeeDocument {
  status: DocumentStatus;
  days_remaining: number;
}

// Input for creating/updating documents
export interface EmployeeDocumentInput {
  employee_id: string;
  document_type: string;
  document_name: string;
  document_number?: string | null;
  issue_date: string;
  expiry_date: string;
  duration_months: number;
  notification_threshold_days: number;
  document_url?: string | null;
  notes?: string | null;
}

// Document service interface
export interface DocumentService {
  getDocumentsForEmployee(employeeId: string): Promise<EmployeeDocument[]>;
  createDocument(document: EmployeeDocumentInput): Promise<EmployeeDocument>;
  updateDocument(id: string, document: Partial<EmployeeDocumentInput>): Promise<EmployeeDocument>;
  deleteDocument(id: string): Promise<void>;
  getExpiringDocuments(thresholdDays?: number): Promise<DocumentWithStatus[]>;
  getExpiredDocuments(): Promise<DocumentWithStatus[]>;
}

// Document form props
export interface DocumentFormProps {
  document?: EmployeeDocument;
  employeeId: string;
  onSubmit: (document: Partial<EmployeeDocument>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
