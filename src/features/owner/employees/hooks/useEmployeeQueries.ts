import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { usePayrollData } from '@shared/hooks/usePayrollData';
import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { supabase } from '@shared/lib/supabase/client';

import {
  getPayrollWindow,
  parseDateAsUTC,
} from '@/features/owner/employees/utils';

export const useEmployeeQueries = (
  selectedBranch: string,
  selectedMonth: string
) => {
  const { data: fetchedEmployees = [], isLoading } = useQuery({
    queryKey: ['employees', selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select(
          `
          *,
          salary_plans!employees_salary_plan_id_fkey (
            id,
            name,
            type,
            config
          ),
          branches (
            name,
            name_ar
          )
        `
        )
        .eq('is_archived', false);

      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime: auto-refetch when employees change
  useRealtimeSubscription({
    table: 'employees',
    queryKeys: [['employees', selectedBranch]],
  });

  const { windowStart, windowEnd } = getPayrollWindow(selectedMonth);

  const activeEmployees = useMemo(
    () =>
      fetchedEmployees.filter((emp) => {
        const empStartDate = parseDateAsUTC(emp.start_date);
        const empEndDate = parseDateAsUTC(emp.end_date);

        return (
          (!empStartDate || empStartDate <= windowEnd) &&
          (!empEndDate || empEndDate > windowStart)
        );
      }),
    [fetchedEmployees, windowStart, windowEnd]
  );

  const employeeIds = useMemo(() => activeEmployees.map((emp) => emp.id), [activeEmployees]);

  const employeeNames = useMemo(
    () => activeEmployees.map((emp) => emp.name),
    [activeEmployees]
  );
  const shouldFilterByEmployees = selectedBranch !== 'all';

  const payrollQuery = usePayrollData({
    selectedMonth,
    employeeIds: shouldFilterByEmployees ? employeeIds : undefined,
    employeeNames: shouldFilterByEmployees ? employeeNames : undefined,
    enabled: activeEmployees.length > 0 || selectedBranch === 'all',
  });

  const payrollData = payrollQuery.data;

  return {
    employees: activeEmployees,
    isLoading,
    existingSales: payrollData?.sales ?? [],
    isLoadingSales: payrollQuery.isLoading,
    monthlyDeductions: payrollData?.deductions ?? [],
    monthlyLoans: payrollData?.loans ?? [],
    monthlyBonuses: payrollData?.bonuses ?? [],
  };
};
