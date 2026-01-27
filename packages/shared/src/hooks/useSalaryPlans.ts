import { useQuery } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';
import { SalaryPlanConfig } from '@shared/types/salary-plans';

export const useSalaryPlans = () => {
  return useQuery({
    queryKey: ['salary_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Sort plans to put "Original Plan" first
      const sortedData = (data || []).sort((a, b) => {
        if (a.name === 'Original Plan') return -1;
        if (b.name === 'Original Plan') return 1;
        return a.name.localeCompare(b.name);
      });

      return sortedData.map((plan) => ({
        ...plan,
        config: plan.config as unknown as SalaryPlanConfig,
      }));
    },
  });
};
