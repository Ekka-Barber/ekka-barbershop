
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/booking";
import { Json } from '@/integrations/supabase/types';

export const useEmployeeManagement = (branch: any) => {
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
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
  });

  const employeeWorkingHours: Record<string, string[]> = {};
  employees.forEach(employee => {
    if (employee.working_hours && typeof employee.working_hours === 'object') {
      employeeWorkingHours[employee.id] = Object.values(employee.working_hours).flat();
    }
  });

  const selectedEmployee = employees[0]; // Default to first employee if none selected

  return {
    employees,
    employeesLoading,
    selectedEmployee,
    employeeWorkingHours
  };
};
