import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeMonthlySalary } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export type SalaryHistorySnapshot = EmployeeMonthlySalary;

interface UseSalaryHistorySnapshotsParams {
  monthYear?: string | null;
  viewMode?: 'month' | 'year';
  employeeIds?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseSalaryHistorySnapshotsResult {
  snapshots: SalaryHistorySnapshot[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  getAvailableYears: () => string[];
  getAvailableMonthsForYear: (year: string) => string[];
  allSnapshots: SalaryHistorySnapshot[] | undefined;
  refetch: () => Promise<void>;
}

export const useSalaryHistorySnapshots = ({
  monthYear = null,
  viewMode = 'month',
  employeeIds,
  page = 1,
  pageSize = 10,
  sortBy = 'payment_confirmation_date',
  sortOrder = 'desc'
}: UseSalaryHistorySnapshotsParams = {}): UseSalaryHistorySnapshotsResult => {
  const {
    data: allSnapshotsData,
    isLoading: isLoadingAll,
    error: errorAll
  } = useQuery({
    queryKey: ['salaryHistorySnapshotsAll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_monthly_salary')
        .select('*');
        
      if (error) throw error;
      return data as SalaryHistorySnapshot[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const {
    data: paginatedData,
    isLoading: isLoadingPaginated,
    error: errorPaginated
  } = useQuery({
    queryKey: ['salaryHistorySnapshots', monthYear, viewMode, employeeIds, page, pageSize, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('employee_monthly_salary')
        .select('*', { count: 'exact' });
      
      // Apply month/year filter
      if (monthYear) {
        if (viewMode === 'month' && monthYear.includes('-')) {
          // Filter by specific month (YYYY-MM)
          query = query.eq('month_year', monthYear);
        } else {
          // Filter by year only
          query = query.like('month_year', `${monthYear}-%`);
        }
      }
      
      // Filter by employee IDs if provided
      if (employeeIds && employeeIds.length > 0) {
        query = query.in('employee_id', employeeIds);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        records: data as SalaryHistorySnapshot[],
        totalCount: count || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getAvailableYears = () => {
    if (!allSnapshotsData) return [];
    
    const years = new Set<string>();
    
    allSnapshotsData.forEach(snapshot => {
      const year = snapshot.month_year.split('-')[0];
      years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort years in descending order
  };
  
  const getAvailableMonthsForYear = (year: string) => {
    if (!allSnapshotsData) return [];
    
    const months = new Set<string>();
    
    allSnapshotsData.forEach(snapshot => {
      if (snapshot.month_year.startsWith(year)) {
        const month = snapshot.month_year.split('-')[1];
        months.add(month);
      }
    });
    
    return Array.from(months).sort(); // Sort months in ascending order
  };

  const isLoading = isLoadingAll || isLoadingPaginated;
  const error = errorAll || errorPaginated || null;
  
  const queryClient = useQueryClient();

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['salary-history-snapshots'] });
  };

  return {
    snapshots: paginatedData?.records || [],
    isLoading,
    error,
    totalCount: paginatedData?.totalCount || 0,
    totalPages: paginatedData?.totalCount 
      ? Math.ceil(paginatedData.totalCount / pageSize) 
      : 0,
    currentPage: page,
    getAvailableYears,
    getAvailableMonthsForYear,
    allSnapshots: allSnapshotsData,
    refetch
  };
}; 