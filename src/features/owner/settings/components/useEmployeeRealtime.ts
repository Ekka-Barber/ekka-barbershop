import { useState, useEffect } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';
import { Employee } from '@shared/types/domains';

export const useEmployeeRealtime = (initialEmployees: Employee[]) => {
  const [localEmployees, setLocalEmployees] =
    useState<Employee[]>(initialEmployees);
  const { toast: _toast } = useToast();

  useEffect(() => {
    setLocalEmployees(initialEmployees);
  }, [initialEmployees]);

  useEffect(() => {
    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employees',
        },
        (payload) => {
          const updatedEmployee = payload.new as Employee;
          setLocalEmployees((prevEmployees) =>
            prevEmployees.map((emp) =>
              emp.id === updatedEmployee.id
                ? { ...emp, ...updatedEmployee }
                : emp
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    localEmployees,
  };
};
