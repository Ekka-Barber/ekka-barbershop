
import { useQuery } from "@tanstack/react-query";

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { accessCodeStorage, sessionAuth } from '@shared/lib/access-code/storage';
import { supabase } from "@shared/lib/supabase/client";
import type { Employee as SharedEmployee } from '@shared/types/domains';

export interface SupabaseEmployee extends SharedEmployee {
  branch_name?: string;
  branch?: string;
  sales?: { amount: number; updated_at: string; month: string };
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | { amount: number; updated_at: string; month: string }
    | null
    | undefined;
}

// Export the Employee type for compatibility
export type Employee = SupabaseEmployee;

// Export the GroupedEmployees type
export interface GroupedEmployees {
  [key: string]: Employee[];
}

interface BranchData {
  branch_id: string;
  name: string;
}

export const useEmployeeData = (selectedMonth?: string, selectedBranchId?: string | null) => {
  // Realtime: auto-refetch when employees or sales change
  useRealtimeSubscription({
    table: 'employees',
    queryKeys: [['employees', selectedMonth, selectedBranchId]],
  });
  useRealtimeSubscription({
    table: 'employee_sales',
    queryKeys: [['employees', selectedMonth, selectedBranchId]],
  });

  const query = useQuery({
    queryKey: ["employees", selectedMonth, selectedBranchId],
    queryFn: async (): Promise<SupabaseEmployee[]> => {
      // Get the branch manager code from storage
      const branchManagerCode = accessCodeStorage.getManagerAccessCode();
      
      if (!branchManagerCode) {
        return [];
      }

      // Branch manager session is established during login

      // Determine if super user from database role
      const isSuper = sessionAuth.getRole() === 'super_manager';

      // Compute month start (YYYY-MM-01) for sales filtering
      const monthStart = (() => {
        if (selectedMonth && /^\d{4}-\d{2}-\d{2}$/.test(selectedMonth)) {
          return selectedMonth; // expected format 'YYYY-MM-01'
        }
        if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
          return `${selectedMonth}-01`;
        }
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-01`;
      })();

      // Base query: only active employees with branch name
      let query = supabase
        .from("employees")
        .select(`
          *,
          branches!inner (
            name
          )
        `)
        .eq("is_archived", false);

      // Further restrict to employees without a past end_date
      const today = new Date().toISOString().slice(0, 10);
      query = query.or(`end_date.is.null,end_date.gte.${today}`);

      // Do not filter nested relation at the SQL level to preserve employees without a record for the selected month.
      // We'll pick the matching month (or latest available) on the client side.

      if (isSuper) {
        // Super can see all active employees, optionally filtered by selected branch
        if (selectedBranchId) {
          query = query.eq("branch_id", selectedBranchId);
        }
      } else {
        // Get the manager's branch via RPC (uses hash comparison)
        const { data: managerBranch, error: managerError } = await supabase
          .rpc('get_current_manager_branch')
          .single();

        if (managerError || !managerBranch) {
          return [];
        }

        const branch = managerBranch as { branch_id: string; is_super_manager: boolean; manager_name: string; branch_name: string };
        // Managers only see their branch employees
        query = query.eq("branch_id", branch.branch_id);
      }

      const { data: employees, error } = await query;

      if (error) {
        throw error;
      }

      // Fetch sales for the selected month only (no month fallback)
      const { data: monthlySales } = await supabase
        .from('employee_sales')
        .select('employee_id, employee_name, month, sales_amount, updated_at')
        .eq('month', monthStart);

      interface MonthlySalesRow {
        employee_id: string | null;
        employee_name: string | null;
        month: string;
        sales_amount: number | string | null;
        updated_at: string | null;
      }

      const salesById = new Map<string, MonthlySalesRow>();
      const salesByName = new Map<string, MonthlySalesRow>();
      for (const row of (monthlySales as MonthlySalesRow[]) || []) {
        if (row.employee_id) salesById.set(row.employee_id, row);
        else if (row.employee_name) salesByName.set(row.employee_name, row);
      }

      // Transform the data to match SupabaseEmployee interface
      const transformedEmployees: SupabaseEmployee[] = employees?.map(emp => {
        const picked = salesById.get(emp.id) || salesByName.get(emp.name);
        const sales = picked ? {
          amount: Number(picked.sales_amount) || 0,
          updated_at: picked.updated_at || new Date().toISOString(),
          month: picked.month
        } : undefined;

        return {
        id: emp.id,
        name: emp.name,
        name_ar: emp.name_ar,
        email: emp.email,
        nationality: emp.nationality,
        photo_url: emp.photo_url,
        annual_leave_quota: emp.annual_leave_quota,
        off_days: emp.off_days,
        branch_id: emp.branch_id,
        is_archived: emp.is_archived,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        salary_plan_id: emp.salary_plan_id,
        start_date: emp.start_date,
        end_date: emp.end_date,
        role: emp.role || 'employee',
        branch: Array.isArray(emp.branches) ? emp.branches[0]?.name : emp.branches?.name,
        branch_name: Array.isArray(emp.branches) ? emp.branches[0]?.name : emp.branches?.name,
        sales
      } as SupabaseEmployee;
      }) || [];

      return transformedEmployees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Get branch data
  const branchQuery = useQuery({
    queryKey: ["branch-data"],
    queryFn: async (): Promise<BranchData> => {
      const branchManagerCode = accessCodeStorage.getManagerAccessCode();
      
      if (!branchManagerCode) {
        return { branch_id: '', name: '' };
      }

      // Check if this is a super admin from database role
      if (sessionAuth.getRole() === 'super_manager') {
        return { branch_id: '__ALL__', name: 'جميع الفروع' };
      }

      // Get manager branch via RPC (uses hash comparison)
      const { data: managerBranch, error: branchError } = await supabase
        .rpc('get_current_manager_branch')
        .single();

      if (branchError || !managerBranch) {
        return { branch_id: '', name: '' };
      }

      const branchInfo = managerBranch as {
        branch_id: string;
        is_super_manager: boolean;
        branch_name: string;
      };
      
      return {
        branch_id: branchInfo.branch_id,
        name: branchInfo.branch_name || '',
      };
    }
  });

  return {
    employees: query.data,
    isLoading: query.isLoading || branchQuery.isLoading,
    error: query.error || branchQuery.error,
    branchData: branchQuery.data,
    refetch: query.refetch
  };
};
