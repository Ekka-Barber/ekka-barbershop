
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useBookingEmployees = (branch: any, selectedBarber?: string) => {
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branch?.id],
    queryFn: async () => {
      if (!branch?.id) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branch.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!branch?.id,
  });

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', selectedBarber],
    queryFn: async () => {
      if (!selectedBarber) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', selectedBarber)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBarber
  });

  return {
    employees,
    employeesLoading,
    selectedEmployee
  };
};
