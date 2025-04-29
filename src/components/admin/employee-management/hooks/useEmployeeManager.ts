import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';
import { PaginationInfo } from '../types'; // Import PaginationInfo type

const ITEMS_PER_PAGE = 9; // 3x3 grid layout

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEmployees = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      console.log('Fetching employees for branch:', selectedBranch, 'page:', page);

      // Calculate start and end range for the current page
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      // Base query
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' }) // Request count along with data
        .range(start, end)
        .order('name');

      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }

      // Execute the single query
      const { data, error, count } = await query;

      if (error) throw error;

      console.log('Fetched employees:', data, 'Total count:', count);

      // Update state
      setEmployees(data as unknown as Employee[] || []); // Ensure data is an array
      setTotalItems(count || 0); // Update total count from the response
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setTotalItems(0);
      // Optionally set currentPage back to 1 or handle error state?
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
