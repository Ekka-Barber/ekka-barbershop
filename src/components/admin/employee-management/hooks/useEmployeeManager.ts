import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee, WorkingHours, EmployeeRole } from '@/types/employee';
import { PaginationInfo, ArchiveStatusFilter } from '../types';
import { logger } from '@/utils/logger';
import { Database } from '@/integrations/supabase/types';

// DO NOT CHANGE - PRESERVE API LOGIC
const ITEMS_PER_PAGE = 9; // 3x3 grid layout

// Define a type for the raw employee data from Supabase, including a potential email field
type DbEmployeeRow = Database['public']['Tables']['employees']['Row'] & {
  email?: string | null; // Explicitly add email if it might be missing from generated types but present in DB
};

export interface UseEmployeeManagerReturn {
  /** List of employees for the current page and branch */
  employees: Employee[];
  /** Loading state for data fetching operations */
  isLoading: boolean;
  /** Error state if any fetch operation fails */
  error: Error | null;
  /** Fetch employees with optional page and filter parameters */
  fetchEmployees: (page?: number, filter?: ArchiveStatusFilter) => Promise<void>;
  /** Pagination information */
  pagination: PaginationInfo;
  /** Set the current page and fetch data for that page */
  setCurrentPage: (page: number) => void;
  /** Get an employee by ID from the current list */
  getEmployeeById: (id: string) => Employee | undefined;
  /** Refresh the current page data */
  refresh: () => Promise<void>;
  /** Set the current archive filter */
  setCurrentArchiveFilter: (filter: ArchiveStatusFilter) => void;
  /** Current archive filter */
  currentArchiveFilter: ArchiveStatusFilter;
}

/**
 * Format raw employee data from Supabase into Employee type
 * DO NOT CHANGE - PRESERVE API LOGIC
 */
const formatEmployeeData = (dbRow: DbEmployeeRow): Employee => {
  const workingHoursObj = dbRow.working_hours;
  let parsedWorkingHours: WorkingHours | undefined = undefined;
  if (typeof workingHoursObj === 'object' && workingHoursObj !== null && !Array.isArray(workingHoursObj)) {
    parsedWorkingHours = workingHoursObj as unknown as WorkingHours; 
  } else if (Array.isArray(workingHoursObj)) {
    // Handle if working_hours is an array - this case might need specific logic
    // For now, treating as undefined if it's an array and not the expected object structure.
    // Or, if it's an array of strings ["09:00-17:00"], it needs different parsing.
    // Assuming it should be an object like { monday: ["09:00-17:00"] } as per WorkingHours type.
    // If dbRow.working_hours can be DB `json` which can be array or object, parsing needs to be robust.
    // For now, this simplistic parsing assumes it's the object type or null/undefined.
    logger.warn('Unexpected array type for working_hours in formatEmployeeData', workingHoursObj);
  }

  // Safely access potentially missing email
  const email = 'email' in dbRow ? dbRow.email : null;

  return {
    id: dbRow.id,
    name: dbRow.name,
    name_ar: dbRow.name_ar || null,
    email: email || null,
    role: dbRow.role as EmployeeRole, // Role is correctly typed in DbEmployeeRow via Enum
    branch_id: dbRow.branch_id || null,
    photo_url: dbRow.photo_url || null,
    working_hours: parsedWorkingHours, // Use parsed or undefined
    off_days: dbRow.off_days || undefined, // off_days is string[] | null in DbEmployeeRow
    nationality: dbRow.nationality || null,
    salary_plan_id: dbRow.salary_plan_id || null,
    start_date: dbRow.start_date || null,
    annual_leave_quota: dbRow.annual_leave_quota === undefined || dbRow.annual_leave_quota === null 
                        ? null 
                        : Number(dbRow.annual_leave_quota),
    is_archived: dbRow.is_archived,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
  };
};

/**
 * Hook for managing employee data with pagination and branch filtering
 * @param selectedBranch - Currently selected branch ID or null for all branches
 * @param initialArchiveFilter - Initial filter for employee archive status
 * @returns Employees data and management functions
 */
export const useEmployeeManager = (
  selectedBranch: string | null, 
  initialArchiveFilter: ArchiveStatusFilter = 'active'
): UseEmployeeManagerReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPageInternal] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentArchiveFilter, setCurrentArchiveFilter] = useState<ArchiveStatusFilter>(initialArchiveFilter);

  /**
   * Fetch employees from database with pagination and optional branch filtering
   * DO NOT CHANGE - PRESERVE API LOGIC
   */
  const fetchEmployees = useCallback(async (page: number = currentPage, filter: ArchiveStatusFilter = currentArchiveFilter) => {
    if (page < 1) {
      logger.warn('Attempted to fetch page less than 1, defaulting to 1');
      page = 1; // Ensure page is at least 1
    }
    
    setCurrentArchiveFilter(filter); // Update current filter state

    try {
      setIsLoading(true);
      setError(null);
      logger.info('Fetching employees for branch:', selectedBranch, 'page:', page, 'archiveFilter:', filter);

      // Calculate start and end range for the current page
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' }) // Request count along with data
        .range(start, end)
        .order('name');

      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }

      // Add archive status filter
      if (filter === 'active') {
        query = query.eq('is_archived', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } 
      // If filter is 'all', no additional is_archived filter is applied

      // Execute the query
      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      logger.info('Fetched employees:', data?.length, 'Total count from response:', count);

      // The count returned in the response header should be for the *filtered* query.
      const formattedEmployees = (data || []).map(dbItem => formatEmployeeData(dbItem as DbEmployeeRow));

      setEmployees(formattedEmployees); 
      setTotalItems(count || 0); // Use the count from the main query
      setCurrentPageInternal(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching employees';
      logger.error('Error fetching employees:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setEmployees([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedBranch, currentArchiveFilter]);

  // Reset to first page when branch changes
  useEffect(() => {
    fetchEmployees(1, currentArchiveFilter);
  }, [selectedBranch, currentArchiveFilter, fetchEmployees]);

  // Calculate pagination info with memoization
  const paginationState = useMemo<PaginationInfo>(() => ({
    currentPage,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE) || 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: totalItems || 0 // Ensure this is always a number, never undefined
  }), [currentPage, totalItems]);

  // Get a specific employee by ID from the current list
  const getEmployeeById = useCallback((id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  // Refresh function to reload current page
  const refresh = useCallback(() => {
    return fetchEmployees(currentPage, currentArchiveFilter);
  }, [fetchEmployees, currentPage, currentArchiveFilter]);

  const setCurrentPageAndFetch = (page: number) => {
    fetchEmployees(page, currentArchiveFilter);
  };

  // This function will be called by the UI to change the filter
  const setArchiveFilter = (filter: ArchiveStatusFilter) => {
    setCurrentPageInternal(1); // Reset to page 1 when filter changes
    setCurrentArchiveFilter(filter); // This will trigger the useEffect to refetch
  };

  // Return complete interface
  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    pagination: paginationState,
    setCurrentPage: setCurrentPageAndFetch,
    getEmployeeById,
    refresh,
    setCurrentArchiveFilter: setArchiveFilter,
    currentArchiveFilter
  };
};
