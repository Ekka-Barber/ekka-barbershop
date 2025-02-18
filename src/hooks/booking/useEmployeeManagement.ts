
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/booking";
import { useMemo } from 'react';
import { Branch } from '@/types/branch';

const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useEmployeeManagement = (branch: Branch | null) => {
  const { data: employees = [], isLoading: employeesLoading, error } = useQuery({
    queryKey: ['employees', branch?.id],
    queryFn: async () => {
      if (!branch?.id) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branch.id);
      
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!branch?.id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });

  // Memoize working hours calculation to prevent unnecessary recalculations
  const employeeWorkingHours = useMemo(() => {
    const hours: Record<string, string[]> = {};
    employees.forEach(employee => {
      if (employee.working_hours && typeof employee.working_hours === 'object') {
        hours[employee.id] = Object.values(employee.working_hours).flat();
      }
    });
    return hours;
  }, [employees]);

  // Find first available employee or null if none exists
  const selectedEmployee = useMemo(() => 
    employees.length > 0 ? employees[0] : null
  , [employees]);

  return {
    employees,
    employeesLoading,
    error,
    selectedEmployee,
    employeeWorkingHours
  };
};
