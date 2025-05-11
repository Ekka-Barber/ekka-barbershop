import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { PaginationState } from '../types';

// Export Branch type so it can be imported elsewhere
export interface Branch {
  id: string;
  name: string;
  name_ar?: string | null;
  working_hours?: Record<string, string[]> | null;
  is_main?: boolean;
  address?: string | null;
  address_ar?: string | null;
  whatsapp_number?: string | null;
  google_maps_url?: string | null;
  google_place_id?: string | null;
}

// Define the ArchiveStatusFilter type
export type ArchiveStatusFilter = 'all' | 'active' | 'archived';

/**
 * Hook for managing employee data with pagination and filtering
 * @param initialBranchId - Initial selected branch ID
 * @returns Employee management functionality
 */
export const useEmployeeManager = (initialBranchId: string | null = null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveStatusFilter>('active');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranchId);
  const [branches, setBranches] = useState<Branch[]>([]);

  const setCurrentPage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const filterByBranch = (branchId: string | null) => {
    setSelectedBranch(branchId);
    setCurrentPage(1); // Reset to first page when branch changes
  };

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .range(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize - 1
        )
        .order('name', { ascending: true });

      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }

      if (archiveFilter === 'active') {
        query = query.eq('is_archived', false);
      } else if (archiveFilter === 'archived') {
        query = query.eq('is_archived', true);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data) {
        setEmployees(data as Employee[]);
        setPagination((prev) => ({
          ...prev,
          totalItems: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.pageSize),
        }));
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, selectedBranch, archiveFilter]);

  const setArchiveStatusFilter = useCallback((status: ArchiveStatusFilter) => {
    setArchiveFilter(status);
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('id, name');

        if (branchError) {
          throw new Error(branchError.message);
        }

        if (branchData) {
          setBranches(branchData as Branch[]);
        }
      } catch (branchErr: any) {
        setError(branchErr instanceof Error ? branchErr : new Error('An unexpected error occurred'));
      }
    };

    fetchBranches();
  }, []);

  return {
    employees,
    isLoading,
    error,
    pagination,
    setCurrentPage,
    filterByBranch,
    selectedBranch,
    branches,
    archiveFilter,
    setArchiveFilter: setArchiveStatusFilter,
    fetchEmployees
  };
};
