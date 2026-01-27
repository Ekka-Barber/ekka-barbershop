import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@shared/lib/query-keys';
import { getPayrollWindow } from '@shared/lib/salary/calculations';
import { supabase } from '@shared/lib/supabase/client';
import type {
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeLoan,
  EmployeeSales,
} from '@shared/types/domains';

interface UsePayrollDataOptions {
  selectedMonth: string;
  employeeIds?: string[];
  employeeNames?: string[];
  enabled?: boolean;
}

interface PayrollTotals {
  sales: number;
  deductions: number;
  loans: number;
  bonuses: number;
}

export interface PayrollDataResult {
  sales: EmployeeSales[];
  deductions: EmployeeDeduction[];
  loans: EmployeeLoan[];
  bonuses: EmployeeBonus[];
  totals: PayrollTotals;
}

const normalizeMonthKey = (value: string) => {
  const [year, month] = value.split('-');
  if (!year || !month) {
    return value;
  }
  return `${year}-${month}`;
};

const normalizeList = (values?: string[]) => {
  if (!values?.length) {
    return undefined;
  }

  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  return uniqueValues.length ? uniqueValues.sort() : undefined;
};

const sumValues = (values: Array<number | string | null | undefined>) =>
  values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0);



export const usePayrollData = ({
  selectedMonth,
  employeeIds,
  employeeNames,
  enabled = true,
}: UsePayrollDataOptions) => {
  const monthKey = normalizeMonthKey(selectedMonth);
  const normalizedEmployeeIds = useMemo(
    () => normalizeList(employeeIds),
    [employeeIds]
  );
  const normalizedEmployeeNames = useMemo(
    () => normalizeList(employeeNames),
    [employeeNames]
  );
  const { windowStartDate, windowEndDate } = getPayrollWindow(monthKey);

  return useQuery({
    queryKey: queryKeys.payroll({
      month: monthKey,
      employeeIds: normalizedEmployeeIds,
      employeeNames: normalizedEmployeeNames,
    }),
    queryFn: async (): Promise<PayrollDataResult> => {
      // Sales should be fetched for the selected month only, not the entire payroll window
      // because sales are recorded per calendar month
      const salesMonth = `${monthKey}-01`;
      let salesQuery = supabase
        .from('employee_sales')
        .select('*')
        .eq('month', salesMonth);

      if (normalizedEmployeeNames?.length) {
        salesQuery = salesQuery.in('employee_name', normalizedEmployeeNames);
      } else if (normalizedEmployeeIds?.length) {
        salesQuery = salesQuery.in('employee_id', normalizedEmployeeIds);
      }

      let deductionsQuery = supabase
        .from('employee_deductions')
        .select('*')
        .gte('date', windowStartDate)
        .lte('date', windowEndDate);

      if (normalizedEmployeeIds?.length) {
        deductionsQuery = deductionsQuery.in(
          'employee_id',
          normalizedEmployeeIds
        );
      } else if (normalizedEmployeeNames?.length) {
        deductionsQuery = deductionsQuery.in(
          'employee_name',
          normalizedEmployeeNames
        );
      }

      let loansQuery = supabase
        .from('employee_loans')
        .select('*')
        .gte('date', windowStartDate)
        .lte('date', windowEndDate)
        .order('date', { ascending: false });

      if (normalizedEmployeeIds?.length) {
        loansQuery = loansQuery.in('employee_id', normalizedEmployeeIds);
      } else if (normalizedEmployeeNames?.length) {
        loansQuery = loansQuery.in('employee_name', normalizedEmployeeNames);
      }

      let bonusesQuery = supabase
        .from('employee_bonuses')
        .select('*')
        .gte('date', windowStartDate)
        .lte('date', windowEndDate);

      if (normalizedEmployeeIds?.length) {
        bonusesQuery = bonusesQuery.in('employee_id', normalizedEmployeeIds);
      } else if (normalizedEmployeeNames?.length) {
        bonusesQuery = bonusesQuery.in('employee_name', normalizedEmployeeNames);
      }

      const [salesResponse, deductionsResponse, loansResponse, bonusesResponse] =
        await Promise.all([
          salesQuery,
          deductionsQuery,
          loansQuery,
          bonusesQuery,
        ]);

      if (salesResponse.error) throw salesResponse.error;
      if (deductionsResponse.error) throw deductionsResponse.error;
      if (loansResponse.error) throw loansResponse.error;
      if (bonusesResponse.error) throw bonusesResponse.error;

      const sales = salesResponse.data ?? [];
      const deductions = deductionsResponse.data ?? [];
      const loans = loansResponse.data ?? [];
      const bonuses = bonusesResponse.data ?? [];

      return {
        sales,
        deductions,
        loans,
        bonuses,
        totals: {
          sales: sumValues(sales.map((sale) => sale.sales_amount)),
          deductions: sumValues(deductions.map((item) => item.amount)),
          loans: sumValues(loans.map((item) => item.amount)),
          bonuses: sumValues(bonuses.map((item) => item.amount)),
        },
      };
    },
    enabled: Boolean(monthKey) && enabled,
  });
};
