import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { queryKeys } from '@shared/lib/query-keys';
import { supabase } from '@shared/lib/supabase/client';
import type { DocumentTypeConfig } from '@shared/types/hr.types';

/**
 * Hook to fetch all document types
 * Returns active document types sorted by display_order
 */
export const useDocumentTypes = (includeInactive = false) => {
  // Realtime: auto-refetch when document types change
  useRealtimeSubscription({
    table: 'document_types',
    queryKeys: [
      queryKeys.hr.documentTypes(true) as unknown as readonly unknown[],
      queryKeys.hr.documentTypes(false) as unknown as readonly unknown[],
    ],
  });

  return useQuery({
    queryKey: queryKeys.hr.documentTypes(includeInactive),
    queryFn: async () => {
      let query = supabase
        .from('document_types')
        .select('*')
        .order('display_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as DocumentTypeConfig[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new document type
 */
export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newType: Omit<DocumentTypeConfig, 'id' | 'created_at' | 'updated_at'>
    ) => {
      const { data, error } = await supabase
        .from('document_types')
        .insert(newType)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as DocumentTypeConfig;
    },
    onSuccess: () => {
      // Invalidate all document type queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(true),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(false),
      });
    },
  });
};

/**
 * Hook to update an existing document type
 */
export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<
        Omit<DocumentTypeConfig, 'id' | 'created_at' | 'updated_at'>
      >;
    }) => {
      const { data, error } = await supabase
        .from('document_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as DocumentTypeConfig;
    },
    onSuccess: (_, variables) => {
      // Invalidate all document type queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(true),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(false),
      });
      // Invalidate specific document type
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.documentTypes(true), 'id', variables.id],
      });
    },
  });
};

/**
 * Hook to delete (soft delete by deactivating) a document type
 */
export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('document_types')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as DocumentTypeConfig;
    },
    onSuccess: () => {
      // Invalidate all document type queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(true),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hr.documentTypes(false),
      });
    },
  });
};

/**
 * Helper hook to get document type options for select dropdowns
 * Returns { value, label } format for use in Select components
 */
export const useDocumentTypeOptions = () => {
  const { data: documentTypes, isLoading, error } = useDocumentTypes(false);

  const options =
    documentTypes?.map((type) => ({
      value: type.code,
      label: type.name_ar,
      defaultDurationMonths: type.default_duration_months,
      notificationThresholdDays: type.notification_threshold_days,
    })) || [];

  return {
    options,
    documentTypes,
    isLoading,
    error,
  };
};

/**
 * Helper hook to get document type metadata by code
 * Useful for getting default duration, icon, color, etc.
 */
export const useDocumentTypeMeta = (code: string | null) => {
  const { data: documentTypes } = useDocumentTypes(false);

  const meta = code
    ? documentTypes?.find((type) => type.code === code)
    : null;

  return {
    meta,
    defaultDurationMonths: meta?.default_duration_months || 12,
    notificationThresholdDays: meta?.notification_threshold_days || 30,
    requiresDocumentNumber: meta?.requires_document_number ?? true,
    nameAr: meta?.name_ar || code || '',
  };
};
