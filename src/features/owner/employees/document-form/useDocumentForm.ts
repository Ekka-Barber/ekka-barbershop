import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { TIME } from '@shared/constants/time';
import { employeeDocumentSchema } from '@shared/lib/form-validation/document-schemas';

import type { DocumentFormValues } from './types';

import type {
  EmployeeDocumentWithStatus,
  DocumentFormData,
} from '@/features/owner/employees/types';

interface UseDocumentFormProps {
  document?: EmployeeDocumentWithStatus | null;
  open: boolean;
  onSubmit: (data: DocumentFormData) => Promise<void>;
}

export const useDocumentForm = ({
  document,
  open,
  onSubmit,
}: UseDocumentFormProps) => {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(employeeDocumentSchema),
    defaultValues: {
      employee_id: '',
      document_type: '',
      document_name: '',
      document_number: '',
      document_url: '',
      issue_date: '',
      expiry_date: '',
      duration_months: TIME.MONTHS_PER_YEAR,
      notification_threshold_days: TIME.DAYS_PER_MONTH_APPROX,
      notes: '',
    } as DocumentFormValues,
  });

  // Reset form when document changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (document) {
        // Edit mode - populate with existing data
          form.reset({
            employee_id: document.employee_id ?? '',
            document_type: document.document_type ?? '',
            document_name: document.document_name ?? '',
            document_number: document.document_number ?? '',
            document_url: document.document_url ?? '',
            issue_date: document.issue_date ?? '',
            expiry_date: document.expiry_date ?? '',
            duration_months: document.duration_months ?? TIME.MONTHS_PER_YEAR,
            notification_threshold_days: document.notification_threshold_days ?? TIME.DAYS_PER_MONTH_APPROX,
            notes: document.notes ?? '',
          } as DocumentFormValues);
      } else {
        // Add mode - reset to defaults
        form.reset({
          employee_id: '',
          document_type: '',
          document_name: '',
          document_number: '',
          document_url: '',
          issue_date: '',
          expiry_date: '',
          duration_months: TIME.MONTHS_PER_YEAR,
          notification_threshold_days: TIME.DAYS_PER_MONTH_APPROX,
          notes: '',
        } as DocumentFormValues);
      }
    }
  }, [document, open, form]);

  const handleSubmit = async (values: DocumentFormValues) => {
    try {
      await onSubmit(values as DocumentFormData);
    } catch {
      // Error handling is managed by parent component
    }
  };

  return {
    form,
    handleSubmit,
  };
};
