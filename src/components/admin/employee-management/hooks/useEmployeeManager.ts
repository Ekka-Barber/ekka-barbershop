import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee, WorkingHours } from '@/types/employee';
import { PaginationInfo } from '../types';
import { logger } from '@/utils/logger';

// DO NOT CHANGE - PRESERVE API LOGIC
const ITEMS_PER_PAGE = 9; // 3x3 grid layout

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Enhanced fetchEmployees with error handling and memoization
  const fetchEmployees = useCallback(async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      setError(null);
      logger.info('Fetching employees for branch:', selectedBranch, 'page:', page);

      // Calculate start and end range for the current page
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      // DO NOT CHANGE - PRESERVE API LOGIC
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' }) // Request count along with data
        .range(start, end)
        .order('name');

      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      logger.info('Fetched employees:', data?.length, 'Total count:', count);

      // Process the raw data to match Employee type
      const formattedEmployees = (data || []).map(emp => {
        // Ensure working_hours is properly handled
        const workingHours = (typeof emp.working_hours === 'object' && emp.working_hours !== null) 
          ? emp.working_hours as unknown as WorkingHours 
          : {};
        
        // Create a formatted employee object with all required fields
        return {
          id: emp.id,
          name: emp.name,
          name_ar: emp.name_ar || '',
          // Set email to empty string if not present in database
          email: '',  
          role: emp.role || '',
          branch_id: emp.branch_id,
          photo_url: emp.photo_url,
          working_hours: workingHours,
          off_days: Array.isArray(emp.off_days) ? emp.off_days : [],
          nationality: emp.nationality,
          salary_plan_id: emp.salary_plan_id,
          start_date: emp.start_date,
          annual_leave_quota: emp.annual_leave_quota,
          created_at: emp.created_at,
          updated_at: emp.updated_at,
        } as Employee;  // Use type assertion here
      });

      // Update state
      setEmployees(formattedEmployees); 
      setTotalItems(count || 0);
      setCurrentPage(page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching employees';
      logger.error('Error fetching employees:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setEmployees([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedBranch]);

  // Reset to first page when branch changes
  useEffect(() => {
    setCurrentPage(1);
    fetchEmployees(1);
  }, [selectedBranch, fetchEmployees]);

  // Calculate pagination info
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
    totalItems
  };

  // Get a specific employee by ID from the current list
  const getEmployeeById = useCallback((id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  // Return enhanced interface
  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    pagination: paginationInfo,
    setCurrentPage: (page: number) => fetchEmployees(page),
    getEmployeeById,
    refresh: () => fetchEmployees(currentPage)
  };
};
