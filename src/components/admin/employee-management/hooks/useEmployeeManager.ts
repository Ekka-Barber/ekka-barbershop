import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee, WorkingHours } from '@/types/employee';
import { PaginationInfo } from '../types';
import { logger } from '@/utils/logger';

// DO NOT CHANGE - PRESERVE API LOGIC
const ITEMS_PER_PAGE = 9; // 3x3 grid layout

/**
 * Hook return type for useEmployeeManager
 */
interface UseEmployeeManagerReturn {
  /** List of employees for the current page and branch */
  employees: Employee[];
  /** Loading state for data fetching operations */
  isLoading: boolean;
  /** Error state if any fetch operation fails */
  error: Error | null;
  /** Fetch employees with optional page parameter */
  fetchEmployees: (page?: number) => Promise<void>;
  /** Pagination information */
  pagination: PaginationInfo;
  /** Set the current page and fetch data for that page */
  setCurrentPage: (page: number) => void;
  /** Get an employee by ID from the current list */
  getEmployeeById: (id: string) => Employee | undefined;
  /** Refresh the current page data */
  refresh: () => Promise<void>;
}

/**
 * Format raw employee data from Supabase into Employee type
 * DO NOT CHANGE - PRESERVE API LOGIC
 */
const formatEmployeeData = (emp: any): Employee => {
  // Ensure working_hours is properly handled
  const workingHours = (typeof emp.working_hours === 'object' && emp.working_hours !== null) 
    ? emp.working_hours as unknown as WorkingHours 
    : {};
  
  // Create a formatted employee object with all required fields
  return {
    id: emp.id,
    name: emp.name,
    name_ar: emp.name_ar || '',
    email: emp.email || '',
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
  } as Employee;
};

/**
 * Hook for managing employee data with pagination and branch filtering
 * @param selectedBranch - Currently selected branch ID or null for all branches
 * @returns Employees data and management functions
 */
export const useEmployeeManager = (selectedBranch: string | null): UseEmployeeManagerReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetch employees from database with pagination and optional branch filtering
   * DO NOT CHANGE - PRESERVE API LOGIC
   */
  const fetchEmployees = useCallback(async (page: number = currentPage) => {
    if (page < 1) {
      logger.error('Invalid page number:', page);
      return;
    }
    
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
      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      logger.info('Fetched employees:', data?.length, 'Total count:', count);

      // Process the raw data to match Employee type
      const formattedEmployees = (data || []).map(formatEmployeeData);

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

  // Calculate pagination info with memoization
  const paginationInfo = useMemo<PaginationInfo>(() => ({
    currentPage,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
    totalItems
  }), [currentPage, totalItems]);

  // Get a specific employee by ID from the current list
  const getEmployeeById = useCallback((id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  // Refresh function to reload current page
  const refresh = useCallback(() => {
    return fetchEmployees(currentPage);
  }, [fetchEmployees, currentPage]);

  // Return complete interface
  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    pagination: paginationInfo,
    setCurrentPage: (page: number) => fetchEmployees(page),
    getEmployeeById,
    refresh
  };
};
