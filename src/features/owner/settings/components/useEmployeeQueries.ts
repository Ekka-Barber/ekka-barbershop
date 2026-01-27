import { useQuery } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';

export const useEmployeeQueries = () => {
  const { data: employees, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select(`
          *,
          branches(name, name_ar),
          salary_plans!employees_salary_plan_id_fkey(name),
          sponsors(name_ar, cr_number)
        `);
      if (error) throw error;
      return data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: salaryPlans } = useQuery({
    queryKey: ['salary_plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salary_plans').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sponsors } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sponsors').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  return {
    employees,
    refetchEmployees,
    branches,
    salaryPlans,
    sponsors,
  };
};
