import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { supabase } from '@shared/lib/supabase/client';
import type {
  DocumentFormData,
  DocumentUpdatePayload,
  EmployeeFormData,
  EmployeeUpdatePayload,
  HRDocument,
  HREmployee,
  HRSponsor,
  SponsorFormData,
  SponsorUpdatePayload,
} from '@shared/types/hr.types';

const QUERY_KEY_EMPLOYEES = ['hr-employees'] as const;
const QUERY_KEY_EMPLOYEES_ARCHIVED = ['hr-employees-archived'] as const;
const QUERY_KEY_DOCUMENTS = ['hr-documents'] as const;
const QUERY_KEY_SPONSORS = ['hr-sponsors'] as const;

export const useEmployeeManagement = () => {
  const queryClient = useQueryClient();

  // Realtime: auto-refetch when employees change
  useRealtimeSubscription({
    table: 'employees',
    queryKeys: [QUERY_KEY_EMPLOYEES as unknown as readonly unknown[], QUERY_KEY_EMPLOYEES_ARCHIVED as unknown as readonly unknown[]],
  });

  const employeesQuery = useQuery({
    queryKey: QUERY_KEY_EMPLOYEES,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_archived', false)
        .order('name_ar', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as HREmployee[];
    },
  });

  const archivedQuery = useQuery({
    queryKey: QUERY_KEY_EMPLOYEES_ARCHIVED,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_archived', true)
        .order('name_ar', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as HREmployee[];
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const payload = {
        ...data,
        is_archived: data.is_archived ?? false,
      };

      const { data: result, error } = await supabase
        .from('employees')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HREmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES_ARCHIVED });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...data }: EmployeeUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HREmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES_ARCHIVED });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES_ARCHIVED });
    },
  });

  const restoreEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('employees')
        .update({ is_archived: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HREmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEES_ARCHIVED });
    },
  });

  return {
    employeesQuery,
    archivedQuery,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
  };
};

export const useDocumentManagement = () => {
  const queryClient = useQueryClient();

  // Realtime: auto-refetch when documents change
  useRealtimeSubscription({
    table: 'employee_documents',
    queryKeys: [['hr-documents']],
  });

  const documentsQuery = useQuery({
    queryKey: QUERY_KEY_DOCUMENTS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as HRDocument[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      const { data: result, error } = await supabase
        .from('employee_documents')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HRDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DOCUMENTS });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...data }: DocumentUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('employee_documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HRDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DOCUMENTS });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DOCUMENTS });
    },
  });

  return {
    documentsQuery,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};

export const useSponsorManagement = () => {
  const queryClient = useQueryClient();

  // Realtime: auto-refetch when sponsors change
  useRealtimeSubscription({
    table: 'sponsors',
    queryKeys: [['hr-sponsors']],
  });

  const sponsorsQuery = useQuery({
    queryKey: QUERY_KEY_SPONSORS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('name_ar', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as HRSponsor[];
    },
  });

  const createSponsor = useMutation({
    mutationFn: async (data: SponsorFormData) => {
      const { data: result, error } = await supabase
        .from('sponsors')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HRSponsor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SPONSORS });
    },
  });

  const updateSponsor = useMutation({
    mutationFn: async ({ id, ...data }: SponsorUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('sponsors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result as HRSponsor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SPONSORS });
    },
  });

  const deleteSponsor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sponsors').delete().eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SPONSORS });
    },
  });

  return {
    sponsorsQuery,
    createSponsor,
    updateSponsor,
    deleteSponsor,
  };
};
