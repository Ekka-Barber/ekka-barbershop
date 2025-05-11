import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
// import { Employee } from '@/types/employee'; // Assuming Employee type is defined here - REMOVED
import { logger } from '@/utils/logger';
import { Database } from '@/integrations/supabase/types';

type DbEmployeeRow = Database['public']['Tables']['employees']['Row'];

export interface SimpleEmployee {
  id: string;
  name: string;
  photo_url: string | null;
}

// Simplified formatter, assuming structure from useEmployeeManager
const formatSimpleEmployeeData = (dbRow: DbEmployeeRow): SimpleEmployee => {
  return {
    id: dbRow.id,
    name: dbRow.name,
    photo_url: dbRow.photo_url || null,
  };
};

interface UseAllActiveEmployeesReturn {
  employees: SimpleEmployee[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useAllActiveEmployees = (): UseAllActiveEmployeesReturn => {
  const [employees, setEmployees] = useState<SimpleEmployee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllActiveEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      logger.info('Fetching all active employees');

      const { data, error: supabaseError } = await supabase
        .from('employees')
        .select('id, name, photo_url')
        .eq('is_archived', false)
        .order('name');

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const formattedEmployees = (data || []).map(dbItem => 
        formatSimpleEmployeeData(dbItem as unknown as DbEmployeeRow) // Cast needed if select is partial
      );
      
      setEmployees(formattedEmployees);
      logger.info(`Fetched ${formattedEmployees.length} active employees.`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching all active employees';
      logger.error('Error fetching all active employees:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllActiveEmployees();
  }, [fetchAllActiveEmployees]);

  return {
    employees,
    isLoading,
    error,
    refetch: fetchAllActiveEmployees,
  };
}; 