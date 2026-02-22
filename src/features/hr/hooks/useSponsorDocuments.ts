import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { queryKeys } from '@shared/lib/query-keys';
import { supabase } from '@shared/lib/supabase/client';
import type {
  SponsorDocument,
  SponsorDocumentInsert,
  SponsorDocumentType,
  SponsorDocumentWithType,
  SponsorDocumentWithStatus,
} from '@shared/types/domains';

export interface SponsorDocumentFormData {
  sponsor_id: string;
  document_type_id: string;
  file: File;
  issue_date: string;
  expiry_date: string;
  duration_months?: number;
  notification_threshold_days?: number;
  notes?: string;
}

export interface SponsorDocumentUpdatePayload {
  id: string;
  issue_date?: string;
  expiry_date?: string;
  duration_months?: number;
  notification_threshold_days?: number;
  notes?: string;
  is_active?: boolean;
}

export interface ExpiringSponsorDocument {
  id: string;
  sponsor_id: string;
  sponsor_name: string;
  document_type_name_ar: string;
  document_type_name_en: string;
  file_name: string;
  expiry_date: string;
  days_until_expiry: number;
}

export const useSponsorDocumentTypes = (includeInactive = false) => {
  useRealtimeSubscription({
    table: 'sponsor_document_types',
    queryKeys: [queryKeys.hr.sponsorDocumentTypes(includeInactive) as unknown as readonly unknown[]],
  });

  return useQuery({
    queryKey: queryKeys.hr.sponsorDocumentTypes(includeInactive),
    queryFn: async () => {
      let query = supabase
        .from('sponsor_document_types')
        .select('*');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('name_ar', { ascending: true });

      if (error) throw error;
      return (data ?? []) as SponsorDocumentType[];
    },
  });
};

export const useSponsorDocuments = (sponsorId?: string) => {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'sponsor_documents',
    queryKeys: [queryKeys.hr.sponsorDocuments({ sponsorId }) as unknown as readonly unknown[]],
  });

  const documentsQuery = useQuery({
    queryKey: queryKeys.hr.sponsorDocuments({ sponsorId }),
    queryFn: async () => {
      let query = supabase
        .from('sponsor_documents')
        .select(`
          *,
          document_type:sponsor_document_types(*)
        `);

      if (sponsorId) {
        query = query.eq('sponsor_id', sponsorId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as SponsorDocumentWithType[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (formData: SponsorDocumentFormData) => {
      const { file, ...docData } = formData;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.sponsor_id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sponsor_documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('sponsor_documents')
        .getPublicUrl(fileName);

      const insertData: SponsorDocumentInsert = {
        sponsor_id: docData.sponsor_id,
        document_type_id: docData.document_type_id,
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        issue_date: docData.issue_date,
        expiry_date: docData.expiry_date,
        duration_months: docData.duration_months ?? 12,
        notification_threshold_days: docData.notification_threshold_days ?? 30,
        notes: docData.notes,
      };

      const { data, error } = await supabase
        .from('sponsor_documents')
        .insert([insertData])
        .select(`
          *,
          document_type:sponsor_document_types(*)
        `)
        .single();

      if (error) {
        try {
          await supabase.storage.from('sponsor_documents').remove([fileName]);
        } catch {
          // ignore cleanup failure
        }
        throw error;
      }

      return data as SponsorDocumentWithType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.sponsorDocuments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.expiringSponsorDocuments() });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...data }: SponsorDocumentUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('sponsor_documents')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          document_type:sponsor_document_types(*)
        `)
        .single();

      if (error) throw error;
      return result as SponsorDocumentWithType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.sponsorDocuments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.expiringSponsorDocuments() });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: SponsorDocument) => {
      const filePath = doc.file_url.split('/sponsor_documents/')[1];
      if (filePath) {
        await supabase.storage.from('sponsor_documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('sponsor_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.sponsorDocuments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.expiringSponsorDocuments() });
    },
  });

  return {
    documentsQuery,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};

export const useExpiringSponsorDocuments = (daysThreshold = 30) => {
  const { documentsQuery } = useSponsorDocuments();

  return useQuery({
    queryKey: queryKeys.hr.expiringSponsorDocuments(daysThreshold),
    queryFn: async () => {
      const documents = documentsQuery.data ?? [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sponsorIds = [...new Set(documents.map((d) => d.sponsor_id))];

      const { data: sponsors, error } = await supabase
        .from('sponsors')
        .select('id, name_ar')
        .in('id', sponsorIds);

      if (error) throw error;

      const sponsorMap = new Map(sponsors?.map((s) => [s.id, s.name_ar]) ?? []);

      const result: ExpiringSponsorDocument[] = [];

      for (const doc of documents) {
        if (!doc.is_active) continue;

        const expiryDate = new Date(doc.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= daysThreshold) {
          result.push({
            id: doc.id,
            sponsor_id: doc.sponsor_id,
            sponsor_name: sponsorMap.get(doc.sponsor_id) ?? 'Unknown',
            document_type_name_ar: doc.document_type.name_ar,
            document_type_name_en: doc.document_type.name_en,
            file_name: doc.file_name,
            expiry_date: doc.expiry_date,
            days_until_expiry: daysUntilExpiry,
          });
        }
      }

      return result.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    },
    enabled: documentsQuery.isSuccess,
  });
};

export const useSponsorDocumentsWithStatus = (sponsorId?: string) => {
  const { documentsQuery, createDocument, updateDocument, deleteDocument } = useSponsorDocuments(sponsorId);

  const documentsWithStatus = useQuery({
    queryKey: [...queryKeys.hr.sponsorDocuments({ sponsorId }), 'with-status'],
    queryFn: async () => {
      const documents = documentsQuery.data ?? [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return documents.map((doc): SponsorDocumentWithStatus => {
        const expiryDate = new Date(doc.expiry_date);
        const daysRemaining = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let status: 'valid' | 'expiring_soon' | 'expired';
        if (daysRemaining < 0) {
          status = 'expired';
        } else if (daysRemaining <= doc.notification_threshold_days) {
          status = 'expiring_soon';
        } else {
          status = 'valid';
        }

        return {
          ...doc,
          days_remaining: daysRemaining,
          status,
        };
      });
    },
    enabled: documentsQuery.isSuccess,
  });

  return {
    documentsQuery: documentsWithStatus,
    createDocument,
    updateDocument,
    deleteDocument,
    isLoading: documentsQuery.isLoading || documentsWithStatus.isLoading,
  };
};
