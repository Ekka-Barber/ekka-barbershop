
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArchiveStatusFilter, Branch } from '../types/index';

export type { ArchiveStatusFilter } from '../types/index';

export const useEmployeeManager = (initialBranchId = null) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveStatusFilter>("active");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId);
  const [branches, setBranches] = useState<Branch[]>([]);

  const setCurrentPage = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const filterByBranch = (branchId) => {
    setSelectedBranch(branchId);
    setCurrentPage(1);
  };

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from("employees").select("*", { count: "exact" }).range(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize - 1
      ).order("name", { ascending: true });

      if (selectedBranch) {
        query = query.eq("branch_id", selectedBranch);
      }

      if (archiveFilter === "active") {
        query = query.eq("is_archived", false);
      } else if (archiveFilter === "archived") {
        query = query.eq("is_archived", true);
      }

      const { data, error: fetchError, count } = await query;
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      if (data) {
        setEmployees(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.pageSize)
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unexpected error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, selectedBranch, archiveFilter]);

  const setArchiveStatusFilter = useCallback((status: ArchiveStatusFilter) => {
    setArchiveFilter(status);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data: branchData, error: branchError } = await supabase.from("branches").select("id, name");
        
        if (branchError) {
          throw new Error(branchError.message);
        }
        
        if (branchData) {
          setBranches(branchData);
        }
      } catch (branchErr) {
        setError(branchErr instanceof Error ? branchErr : new Error("An unexpected error occurred"));
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
