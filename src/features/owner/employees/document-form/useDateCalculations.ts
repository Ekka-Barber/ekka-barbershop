import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import type { DocumentFormValues } from './types';

import { DOCUMENT_TYPES } from '@/features/owner/employees/types';


interface UseDateCalculationsProps {
  form: UseFormReturn<DocumentFormValues>;
}

export const useDateCalculations = ({ form }: UseDateCalculationsProps) => {
  // Auto-calculate expiry date when issue date or duration changes
  const issueDate = form.watch('issue_date');
  const durationMonths = form.watch('duration_months');
  const documentType = form.watch('document_type');

  useEffect(() => {
    if (issueDate && durationMonths) {
      const issue = new Date(issueDate);
      const expiry = new Date(issue);
      expiry.setMonth(expiry.getMonth() + durationMonths);
      form.setValue('expiry_date', expiry.toISOString().split('T')[0]);
    }
  }, [issueDate, durationMonths, form]);

  // Auto-set default duration when document type changes
  useEffect(() => {
    if (documentType && documentType in DOCUMENT_TYPES) {
      const typeConfig =
        DOCUMENT_TYPES[documentType as keyof typeof DOCUMENT_TYPES];
      form.setValue('duration_months', typeConfig.defaultDuration);
    }
  }, [documentType, form]);
};
