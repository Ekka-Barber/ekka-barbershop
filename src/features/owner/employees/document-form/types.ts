import type { EmployeeDocumentSchema } from '@shared/lib/form-validation/document-schemas';

import type {
  Employee,
  EmployeeDocumentWithStatus,
  DocumentFormData,
} from '@/features/owner/employees/types';

export interface DocumentFormProps {
  employees: Employee[];
  document?: EmployeeDocumentWithStatus | null;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  open: boolean;
}

// Using shared document validation schema
export type DocumentFormValues = EmployeeDocumentSchema;
