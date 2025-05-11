
// Define basic document types

// Use enum instead of type for values that need to be used at runtime
export enum DocumentType {
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  RESIDENCE_PERMIT = "residence_permit",
  WORK_PERMIT = "work_permit",
  INSURANCE = "insurance",
  CONTRACT = "contract",
  CERTIFICATE = "certificate",
  LICENSE = "license",
  TAX_DOCUMENT = "tax_document",
  MEDICAL_TEST = "medical_test",
  EDUCATION = "education",
  REFERENCE = "reference",
  OTHER = "other",
  VISA = "visa"
}

// Use enum instead of type for values that need to be used at runtime
export enum DocumentStatus {
  VALID = "valid",
  EXPIRING = "expiring",
  EXPIRED = "expired",
  MISSING = "missing"
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  document_name: string;
  document_number?: string;
  document_url?: string;
  issue_date: Date | string;
  expiry_date: Date | string;
  duration_months: number;
  notification_threshold_days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentWithStatus extends EmployeeDocument {
  status: DocumentStatus;
  days_remaining?: number;
}

export interface DocumentCalculation {
  status: DocumentStatus;
  days_remaining?: number;
}

export interface EmployeeDocumentInput {
  document_type: DocumentType;
  document_name: string;
  document_number?: string;
  issue_date: Date | string;
  expiry_date: Date | string;
  document_url?: string;
  notification_threshold_days: number;
  duration_months: number;
  notes?: string;
}

export interface DocumentService {
  fetchDocuments: (employeeId: string) => Promise<EmployeeDocument[]>;
  addDocument: (employeeId: string, document: EmployeeDocumentInput) => Promise<EmployeeDocument>;
  updateDocument: (documentId: string, document: Partial<EmployeeDocumentInput>) => Promise<EmployeeDocument>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  calculateDocumentStatus: (document: EmployeeDocument) => DocumentCalculation;
}

export interface DocumentFormProps {
  onSubmit: (document: Partial<EmployeeDocument>) => Promise<void>;
  defaultValues?: Partial<EmployeeDocument>;
  documentType?: DocumentType;
  isSubmitting?: boolean;
  onCancel: () => void;
}
