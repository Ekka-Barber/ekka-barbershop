
// Document types
export enum DocumentType {
  PASSPORT = 'passport',
  ID_CARD = 'id_card',
  DRIVING_LICENSE = 'driving_license',
  WORK_PERMIT = 'work_permit',
  RESIDENCE_PERMIT = 'residence_permit',
  INSURANCE = 'insurance',
  CONTRACT = 'contract',
  OTHER = 'other',
}

// Document status
export enum DocumentStatus {
  VALID = 'valid',
  WARNING = 'warning',
  EXPIRED = 'expired',
}

// Document calculation result
export interface DocumentCalculation {
  daysRemaining: number | null;
  isExpired: boolean;
  isWarning: boolean;
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
}
