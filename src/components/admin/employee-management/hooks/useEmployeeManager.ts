
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedBranch) {
      fetchEmployees();
    }
  }, [selectedBranch]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('employees').select('*');
      
      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Explicitly cast the data to Employee[] type
      setEmployees(data as unknown as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    employees,
    isLoading,
    fetchEmployees
  };
};
