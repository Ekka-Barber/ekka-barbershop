import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';

const ITEMS_PER_PAGE = 9; // 3x3 grid layout

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEmployees = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      
      console.log('Fetching employees for branch:', selectedBranch, 'page:', page);
      
      // First, get total count
      let countQuery = supabase.from('employees').select('id', { count: 'exact' });
      if (selectedBranch) {
        countQuery = countQuery.eq('branch_id', selectedBranch);
      }
      const { count: total, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Calculate pagination values
      const totalCount = total || 0;
      setTotalItems(totalCount);
      
      // Calculate start and end range for the current page
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;
      
      // Fetch paginated data
      let query = supabase
        .from('employees')
        .select('*')
        .range(start, end)
        .order('name');
      
      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched employees:', data);
      
      // Explicitly cast the data to Employee[] type
      setEmployees(data as unknown as Employee[]);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to first page when branch changes
  useEffect(() => {
    setCurrentPage(1);
    fetchEmployees(1);
  }, [selectedBranch]);

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
    totalItems
  };

  return {
    employees,
    isLoading,
    fetchEmployees,
    pagination: paginationInfo,
    setCurrentPage: (page: number) => fetchEmployees(page)
  };
};
