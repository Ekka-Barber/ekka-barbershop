import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { TIME } from '@shared/constants/time';
import { supabase } from '@shared/lib/supabase/client';

import type {
  EmployeeDocumentWithStatus,
  DocumentFilters,
  DocumentFormData,
} from '../types';

export const useEmployeeDocuments = (filters: DocumentFilters = {}) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch documents with filters
  const {
    data: documents = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['employee-documents', filters],
    queryFn: async (): Promise<EmployeeDocumentWithStatus[]> => {
      let query = supabase
        .from('employee_documents_with_status')
        .select('*')
        .order('expiry_date', { ascending: true });

      // Apply filters
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      if (filters.documentType) {
        query = query.eq('document_type', filters.documentType);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.searchTerm) {
        query = query.or(
          `document_name.ilike.%${filters.searchTerm}%,employee_name.ilike.%${filters.searchTerm}%,document_number.ilike.%${filters.searchTerm}%`
        );
      }

      if (filters.issueDateFrom) {
        query = query.gte('issue_date', filters.issueDateFrom);
      }

      if (filters.issueDateTo) {
        query = query.lte('issue_date', filters.issueDateTo);
      }

      if (filters.expiryDateFrom) {
        query = query.gte('expiry_date', filters.expiryDateFrom);
      }

      if (filters.expiryDateTo) {
        query = query.lte('expiry_date', filters.expiryDateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform to match expected type structure
      return (data || []).map((doc) => ({
        id: doc.id || '',
        employee_id: doc.employee_id || '',
        employee_name: doc.employee_name || '',
        branch_id: doc.branch_id || '',
        branch_name: doc.branch_name || '',
        document_type: doc.document_type || '',
        document_name: doc.document_name || '',
        document_number: doc.document_number || '',
        document_url: doc.document_url || '',
        issue_date: doc.issue_date || '',
        expiry_date: doc.expiry_date || '',
        duration_months: doc.duration_months || TIME.MONTHS_PER_YEAR,
        notification_threshold_days:
          doc.notification_threshold_days || TIME.DAYS_PER_MONTH_APPROX,
        status: doc.status || 'valid',
        days_remaining: doc.days_remaining || 0,
        notes: doc.notes || '',
        created_at: doc.created_at || '',
        updated_at: doc.updated_at || '',
      })) as EmployeeDocumentWithStatus[];
    },
    meta: {
      onError: (error: Error) => {
        setError(error.message);
      },
    },
  });

  // Helper functions for document filtering
  const getExpiringDocuments = useCallback(() => {
    return documents.filter((doc) => doc.status === 'expiring_soon');
  }, [documents]);

  const getExpiredDocuments = useCallback(() => {
    return documents.filter((doc) => doc.status === 'expired');
  }, [documents]);

  const getValidDocuments = useCallback(() => {
    return documents.filter((doc) => doc.status === 'valid');
  }, [documents]);

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (documentData: DocumentFormData) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert([documentData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DocumentFormData>;
    }) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    documents,
    isLoading,
    error,
    clearError,
    refetch,
    getExpiringDocuments,
    getExpiredDocuments,
    getValidDocuments,
    createDocument: createMutation.mutateAsync,
    updateDocument: updateMutation.mutateAsync,
    deleteDocument: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
