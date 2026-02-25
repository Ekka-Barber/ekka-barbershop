import { useQuery } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { accessCodeStorage, sessionAuth } from '@shared/lib/access-code/storage';
import { supabase } from '@shared/lib/supabase/client';

import { useEmployeeDocumentsData } from './useEmployeeDocumentsData';

interface EmployeeSalesRow {
  employee_id: string | null;
  employee_name: string;
  month: string;
  sales_amount: number;
}

interface EmployeeWithSales {
  id: string;
  name: string;
  name_ar?: string;
  sales: number;
}

export interface DashboardMetrics {
  employees: {
    total: number;
    active: number;
    onLeave: number;
  };
  sales: {
    currentMonth: number;
    previousMonth: number;
    difference: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
  };
  topPerformers: EmployeeWithSales[];
  documents: {
    expired: number;
    expiring: number;
    valid: number;
    total: number;
  };
  insurance: {
    expired: number;
    expiring: number;
    valid: number;
    total: number;
  };
}

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getPreviousMonthKey = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

export const useDashboardMetrics = () => {
  const { employees: employeesWithDocs, isLoading: docsLoading } = useEmployeeDocumentsData();

  useRealtimeSubscription({
    table: 'employees',
    queryKeys: [['dashboard-metrics']],
  });
  useRealtimeSubscription({
    table: 'employee_sales',
    queryKeys: [['dashboard-metrics']],
  });
  useRealtimeSubscription({
    table: 'employee_holidays',
    queryKeys: [['dashboard-metrics']],
  });

  const metricsQuery = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const branchManagerCode = accessCodeStorage.getManagerAccessCode();
      if (!branchManagerCode) {
        throw new Error('No access code');
      }

      const isSuper = sessionAuth.getRole() === 'super_manager';
      const today = new Date().toISOString().slice(0, 10);
      const currentMonthKey = getCurrentMonthKey();
      const previousMonthKey = getPreviousMonthKey();

      let branchFilter: string | null = null;

      if (!isSuper) {
        const { data: managerBranch, error: managerError } = await supabase
          .rpc('get_current_manager_branch')
          .single();

        if (managerError || !managerBranch) {
          throw new Error('Could not get manager branch');
        }

        const branch = managerBranch as { branch_id: string };
        branchFilter = branch.branch_id;
      }

      let employeesQuery = supabase
        .from('employees')
        .select('id, name, name_ar, is_archived, end_date, branch_id')
        .eq('is_archived', false)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (branchFilter) {
        employeesQuery = employeesQuery.eq('branch_id', branchFilter);
      }

      const { data: employees, error: employeesError } = await employeesQuery;

      if (employeesError) throw employeesError;

      const employeeIds = (employees || []).map((e) => e.id);
      const totalEmployees = employees?.length || 0;

      const { data: holidays } = await supabase
        .from('employee_holidays')
        .select('employee_id, date, end_date')
        .in('employee_id', employeeIds)
        .lte('date', today)
        .gte('end_date', today);

      const onLeaveIds = new Set((holidays || []).map((h) => h.employee_id));
      const onLeaveCount = onLeaveIds.size;
      const activeCount = totalEmployees - onLeaveCount;

      let salesQuery = supabase
        .from('employee_sales')
        .select('employee_id, employee_name, month, sales_amount')
        .in('month', [currentMonthKey, previousMonthKey]);

      if (branchFilter) {
        const { data: branchEmployees } = await supabase
          .from('employees')
          .select('id, name')
          .eq('branch_id', branchFilter);
        
        const branchEmployeeIds = (branchEmployees || []).map((e) => e.id);
        const branchEmployeeNames = (branchEmployees || []).map((e) => e.name);
        
        if (branchEmployeeIds.length > 0) {
          salesQuery = supabase
            .from('employee_sales')
            .select('employee_id, employee_name, month, sales_amount')
            .in('month', [currentMonthKey, previousMonthKey])
            .or(`employee_id.in.(${branchEmployeeIds.join(',')}),employee_name.in.(${branchEmployeeNames.map(n => `"${n}"`).join(',')})`);
        }
      }

      const { data: salesData } = await salesQuery;

      const currentMonthSales: EmployeeSalesRow[] = [];
      const previousMonthSales: EmployeeSalesRow[] = [];

      for (const sale of (salesData || []) as EmployeeSalesRow[]) {
        if (sale.month === currentMonthKey) {
          currentMonthSales.push(sale);
        } else if (sale.month === previousMonthKey) {
          previousMonthSales.push(sale);
        }
      }

      const currentMonthTotal = currentMonthSales.reduce((sum, s) => sum + Number(s.sales_amount || 0), 0);
      const previousMonthTotal = previousMonthSales.reduce((sum, s) => sum + Number(s.sales_amount || 0), 0);
      const difference = currentMonthTotal - previousMonthTotal;

      let percentageChange = 0;
      let trend: 'up' | 'down' | 'neutral' = 'neutral';

      if (previousMonthTotal > 0) {
        percentageChange = Math.round((difference / previousMonthTotal) * 100);
        trend = difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral';
      } else if (currentMonthTotal > 0) {
        percentageChange = 100;
        trend = 'up';
      }

      const salesByEmployee = new Map<string, { id: string; name: string; name_ar?: string; sales: number }>();

      for (const emp of employees || []) {
        const sale = currentMonthSales.find(
          (s) => s.employee_id === emp.id || s.employee_name === emp.name
        );
        salesByEmployee.set(emp.id, {
          id: emp.id,
          name: emp.name,
          name_ar: emp.name_ar,
          sales: Number(sale?.sales_amount || 0),
        });
      }

      const topPerformers = Array.from(salesByEmployee.values())
        .filter((e) => e.sales > 0)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3);

      let totalValidDocs = 0;
      let totalExpiredDocs = 0;
      let totalExpiringDocs = 0;

      for (const emp of employeesWithDocs || []) {
        totalValidDocs += emp.document_counts.valid;
        totalExpiredDocs += emp.document_counts.expired;
        totalExpiringDocs += emp.document_counts.expiring_soon;
      }

      const totalDocs = totalValidDocs + totalExpiredDocs + totalExpiringDocs;

      const totalInsurance = employeesWithDocs?.filter((e) => e.insurance).length || 0;
      const expiredInsurance = employeesWithDocs?.filter((e) => e.insurance?.status === 'expired').length || 0;
      const expiringInsurance = employeesWithDocs?.filter((e) => e.insurance?.status === 'expiring_soon').length || 0;
      const validInsurance = totalInsurance - expiredInsurance - expiringInsurance;

      return {
        employees: {
          total: totalEmployees,
          active: activeCount,
          onLeave: onLeaveCount,
        },
        sales: {
          currentMonth: currentMonthTotal,
          previousMonth: previousMonthTotal,
          difference: Math.abs(difference),
          percentageChange,
          trend,
        },
        topPerformers,
        documents: {
          expired: totalExpiredDocs,
          expiring: totalExpiringDocs,
          valid: totalValidDocs,
          total: totalDocs,
        },
        insurance: {
          expired: expiredInsurance,
          expiring: expiringInsurance,
          valid: validInsurance,
          total: totalInsurance,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !docsLoading,
  });

  return {
    metrics: metricsQuery.data,
    isLoading: metricsQuery.isLoading || docsLoading,
    error: metricsQuery.error,
    refetch: metricsQuery.refetch,
  };
};
