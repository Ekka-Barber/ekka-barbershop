
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { SalaryPlan } from '../types/salary';
import { PlanQueryResult } from './utils/types';

/**
 * Hook to fetch the salary plan for an employee
 */
export const useSalaryPlanQuery = (employee: Employee): PlanQueryResult => {
  const planQuery = useQuery<SalaryPlan | null>({
    queryKey: ['employee-salary-plan', employee.salary_plan_id],
    queryFn: async () => {
      if (!employee.salary_plan_id) return null;
      
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .eq('id', employee.salary_plan_id)
        .single();
      
      if (error) throw error;
      return data as SalaryPlan;
    },
    enabled: !!employee.salary_plan_id
  });
  
  return {
    data: planQuery.data || null,
    isLoading: planQuery.isLoading
  };
};
