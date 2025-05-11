
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching employees for branch:', selectedBranch);
      // When no branch is selected, show all employees to allow branch assignment
      let query = supabase.from('employees').select('*');
      
      // Add branch filter if a branch is selected
      if (selectedBranch) {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched employees:', data);
      
      // Explicitly cast the data to Employee[] type
      setEmployees(data as unknown as Employee[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedBranch]);

  return {
    employees,
    isLoading,
    fetchEmployees
  };
};
