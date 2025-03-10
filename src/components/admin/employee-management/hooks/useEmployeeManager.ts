
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types/employee';

export const useEmployeeManager = (selectedBranch: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedBranch) {
      fetchEmployees();
    } else {
      setEmployees([]);
      setIsLoading(false);
    }
  }, [selectedBranch]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching employees for branch:', selectedBranch);
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

  return {
    employees,
    isLoading,
    fetchEmployees
  };
};
