import { useQuery } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(
          `
          *,
          branches(id, name, name_ar),
          salary_plans!employees_salary_plan_id_fkey(id, name, config, type)
        `
        )
        .eq('is_archived', false)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};
