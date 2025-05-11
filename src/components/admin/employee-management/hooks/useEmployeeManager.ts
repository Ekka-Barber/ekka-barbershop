import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';
import { ArchiveStatusFilter } from '../types';

export const useEmployeeManager = (initialBranchId: string | null = null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranchId);
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatusFilter>('active');

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase
      .from('employees')
      .select('*', { count: 'exact' })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
      .eq('is_archived', archiveStatus === 'archived');

    if (selectedBranch && selectedBranch !== 'all') {
      query = query.eq('branch_id', selectedBranch);
    } else if (selectedBranch === 'all') {
      query = query.not('branch_id', 'is', null);
    }

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      setError(fetchError);
    } else {
      setEmployees(data || []);
      setTotalItems(count || 0);
    }

    setIsLoading(false);
  }, [currentPage, pageSize, selectedBranch, archiveStatus]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    setIsLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      setError(updateError);
    } else {
      // Optimistically update the employee in the local state
      setEmployees(prevEmployees =>
        prevEmployees.map(employee =>
          employee.id === id ? { ...employee, ...updates } : employee
        )
      );
    }

    setIsLoading(false);
  }, []);

  const archiveEmployee = useCallback(async (id: string, isArchived: boolean) => {
    setIsLoading(true);
    setError(null);

    const { error: archiveError } = await supabase
      .from('employees')
      .update({ is_archived: isArchived })
      .eq('id', id);

    if (archiveError) {
      setError(archiveError);
    } else {
      // Optimistically update the employee in the local state
      setEmployees(prevEmployees =>
        prevEmployees.map(employee =>
          employee.id === id ? { ...employee, is_archived: isArchived } : employee
        )
      );
    }

    setIsLoading(false);
  }, []);

  const setBranchFilter = useCallback((branchId: string | null) => {
    setSelectedBranch(branchId);
    setCurrentPage(1); // Reset to the first page when the branch changes
  }, []);

  const setArchiveFilter = useCallback((status: ArchiveStatusFilter) => {
    setArchiveStatus(status);
    setCurrentPage(1); // Reset to the first page when the archive status changes
  }, []);

  const pagination = {
    currentPage,
    totalPages: Math.ceil(totalItems / pageSize),
    totalItems,
    pageSize,
  };

  return {
    employees,
    isLoading,
    error,
    pagination,
    setCurrentPage,
    fetchEmployees,
    updateEmployee,
    archiveEmployee,
    selectedBranch,
    setBranchFilter,
    archiveStatus,
    setArchiveFilter
  };
};
