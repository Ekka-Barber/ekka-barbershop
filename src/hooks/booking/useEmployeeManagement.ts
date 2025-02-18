
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { BarberDetails } from "@/types/booking";
import { Json } from '@/integrations/supabase/types';

interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: string;
  photo_url: string | null;
  nationality: string | null;
  working_hours: Json;
  off_days: string[] | null;
}

const transformEmployeeToBarberDetails = (employee: Employee): BarberDetails => {
  let workingHours: Record<string, string[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };
  
  if (typeof employee.working_hours === 'object' && employee.working_hours !== null) {
    const hours = employee.working_hours as Record<string, unknown>;
    Object.keys(hours).forEach(day => {
      if (Array.isArray(hours[day])) {
        workingHours[day] = hours[day] as string[];
      }
    });
  }

  return {
    id: employee.id,
    name: employee.name,
    name_ar: employee.name_ar,
    role: employee.role,
    photo_url: employee.photo_url,
    nationality: employee.nationality,
    working_hours: workingHours,
    off_days: employee.off_days || []
  };
};

export const useEmployeeManagement = (branch: any, selectedEmployeeId?: string) => {
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branch?.id],
    queryFn: async () => {
      if (!branch?.id) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branch.id);
      
      if (error) throw error;
      return data.map(transformEmployeeToBarberDetails);
    },
    enabled: !!branch?.id,
  });

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: async () => {
      if (!selectedEmployeeId) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', selectedEmployeeId)
        .maybeSingle();
      
      if (error) throw error;
      return data ? transformEmployeeToBarberDetails(data) : null;
    },
    enabled: !!selectedEmployeeId
  });

  return {
    employees,
    employeesLoading,
    selectedEmployee
  };
};
