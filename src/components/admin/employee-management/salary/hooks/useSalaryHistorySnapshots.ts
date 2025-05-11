import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export interface SalaryHistorySnapshot {
  id: string;
  employee_id: string;
  employee_name_snapshot: string;
  month_year: string;
  payment_confirmation_date: string;
  base_salary: number;
  sales_amount: number;
  commission_amount: number;
  total_bonuses: number;
  total_deductions: number;
  total_loan_repayments: number;
  net_salary_paid: number;
  salary_plan_id_snapshot: string | null;
  salary_plan_name_snapshot: string | null;
  calculation_details_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface QueryResult {
  snapshots: SalaryHistorySnapshot[];
  totalCount: number;
}

export interface SalaryHistoryFilters {
  employeeIds?: string[];
  monthYear?: string;
  startDate?: string;
  endDate?: string;
  viewMode?: 'month' | 'year';
}

export const useSalaryHistorySnapshots = (filters: SalaryHistoryFilters = {}) => {
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
  });

  const [sorting, setSorting] = useState({
    column: 'payment_confirmation_date',
    direction: 'desc' as 'asc' | 'desc',
  });
  
  // State to store all snapshots for counting purposes
  const [allSnapshots, setAllSnapshots] = useState<SalaryHistorySnapshot[]>([]);

  const fetchSalaryHistory = async (): Promise<QueryResult> => {
    const { employeeIds, monthYear, startDate, endDate, viewMode } = filters;
    
    let query = supabase
      .from('employee_monthly_salary')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (employeeIds && employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds);
    }
    
    if (monthYear) {
      query = query.eq('month_year', monthYear);
    }
    
    if (viewMode === 'year' && monthYear) {
      // If in year view, filter by year part of month_year (first 4 characters)
      const year = monthYear.substring(0, 4);
      query = query.like('month_year', `${year}-%`);
    }
    
    if (startDate) {
      query = query.gte('payment_confirmation_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('payment_confirmation_date', endDate);
    }
    
    // Apply sorting
    query = query.order(sorting.column, { ascending: sorting.direction === 'asc' });
    
    // Apply pagination
    query = query
      .range(pagination.page * pagination.pageSize, (pagination.page + 1) * pagination.pageSize - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching salary history:', error);
      throw error;
    }
    
    return {
      snapshots: data as SalaryHistorySnapshot[] || [],
      totalCount: count || 0,
    };
  };
  
  // Function to fetch all records without pagination for accurate counting
  const fetchAllSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_monthly_salary')
        .select('*');
        
      if (error) {
        console.error('Error fetching all salary history for counting:', error);
        return;
      }
      
      setAllSnapshots(data as SalaryHistorySnapshot[] || []);
    } catch (err) {
      console.error('Unexpected error fetching all snapshots:', err);
    }
  };
  
  // Fetch all snapshots once when the hook mounts
  useEffect(() => {
    fetchAllSnapshots();
  }, []);

  const queryKey = ['salary-history', {
    employeeIds: filters.employeeIds,
    monthYear: filters.monthYear,
    startDate: filters.startDate,
    endDate: filters.endDate,
    viewMode: filters.viewMode,
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortColumn: sorting.column,
    sortDirection: sorting.direction
  }];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchSalaryHistory,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to get unique years from snapshots
  const getAvailableYears = () => {
    if (!allSnapshots.length) return [];
    const years = new Set(allSnapshots.map(s => s.month_year.substring(0, 4)));
    return Array.from(years).sort();
  };

  // Helper function to get available months for a specific year
  const getAvailableMonthsForYear = (year: string) => {
    if (!allSnapshots.length) return [];
    const months = allSnapshots
      .filter(s => s.month_year.startsWith(year))
      .map(s => s.month_year.substring(5, 7));
    
    return Array.from(new Set(months)).sort();
  };

  return {
    snapshots: data?.snapshots || [],
    totalCount: data?.totalCount || 0,
    allSnapshots, // Expose all snapshots for accurate counting in the UI
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    setPagination,
    sorting,
    setSorting,
    getAvailableYears,
    getAvailableMonthsForYear
  };
}; 