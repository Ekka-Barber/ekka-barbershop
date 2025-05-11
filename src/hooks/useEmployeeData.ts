
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for fetching employee data by ID
 */
export const useEmployeeData = (employeeId: string | undefined) => {
  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId
  });

  return { selectedEmployee };
};
