import type {
  Branch,
  Employee,
  EmployeeDocument,
  EmployeeDocumentInsert,
  EmployeeDocumentUpdate,
  EmployeeInsert,
  EmployeeUpdate,
  Sponsor,
  SponsorInsert,
  SponsorUpdate,
} from '@shared/types/domains';

export type EmployeeRole = Employee['role'];

// Document type code is now dynamic from database
export type DocumentType = string;

// Document Type Configuration from database
export interface DocumentTypeConfig {
  id: string;
  code: DocumentType;
  name_ar: string;
  name_en?: string;
  default_duration_months: number;
  notification_threshold_days: number;
  is_active: boolean;
  requires_document_number: boolean;
  color?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type HRBranchOption = Pick<Branch, 'id' | 'name' | 'name_ar'>;

export type HREmployee = Employee;
export type HRSponsor = Sponsor;

export type EmployeeFormData = Omit<EmployeeInsert, 'salary_plan_id'> & {
  salary_plan_id?: never;
};

export type EmployeeUpdatePayload = Omit<EmployeeUpdate, 'salary_plan_id'> & {
  id: string;
  salary_plan_id?: never;
};

export type HRDocument = Omit<EmployeeDocument, 'document_type'> & {
  document_type: DocumentType;
};

export type DocumentFormData = Omit<EmployeeDocumentInsert, 'document_type'> & {
  document_type: DocumentType;
};

export type DocumentUpdatePayload = Omit<EmployeeDocumentUpdate, 'document_type'> & {
  id: string;
  document_type?: DocumentType;
};

export type SponsorFormData = SponsorInsert;
export type SponsorUpdatePayload = SponsorUpdate & {
  id: string;
};


