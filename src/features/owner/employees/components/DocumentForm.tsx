import React from 'react';

import { DocumentFormDialog } from '../document-form/DocumentFormDialog';
import { useDateCalculations } from '../document-form/useDateCalculations';
import { useDocumentForm } from '../document-form/useDocumentForm';

import type {
  DocumentFormData,
  EmployeeDocumentWithStatus,
} from '@/features/owner/employees/types';
import type { Employee } from '@/features/owner/employees/types';

interface DocumentFormProps {
  employees: Employee[];
  document?: EmployeeDocumentWithStatus | null;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  open: boolean;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  employees,
  document,
  onSubmit,
  onCancel,
  isLoading = false,
  open,
}) => {
  const { form, handleSubmit } = useDocumentForm({ document, open, onSubmit });
  useDateCalculations({ form });

  return (
    <DocumentFormDialog
      employees={employees}
      document={document}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      open={open}
      form={form}
      handleSubmit={handleSubmit}
    />
  );
};
