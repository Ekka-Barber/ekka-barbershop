import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';
import { logger } from '@shared/utils/logger';

import type {
  LeaveRecord,
  Employee,
  LeaveBalance,
  AddLeaveData,
  LeavesByEmployee,
} from '../types';
import { calculateAccruedLeave } from '../utils/leaveCalculations';

export const useLeaveTab = (selectedMonth: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leave records for all employees (independent of payroll window)
  const { data: leaveRecords = [], isLoading } = useQuery({
    queryKey: ['employee-leaves', selectedMonth],
    queryFn: async (): Promise<LeaveRecord[]> => {
      const { data, error } = await supabase
        .from('employee_holidays')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as LeaveRecord[];
    },
  });

  // Add leave mutation
  const addLeaveMutation = useMutation({
    mutationFn: async (leaveData: AddLeaveData) => {
      const { data, error } = await supabase
        .from('employee_holidays')
        .insert(leaveData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leaves'] });
      toast({
        title: 'Success',
        description: 'Leave record added successfully',
      });
    },
    onError: (error) => {
      logger.error('Error adding leave:', { error: error.message });
      toast({
        title: 'Error',
        description: 'Failed to add leave record',
        variant: 'destructive',
      });
    },
  });

  // Delete leave mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      const { error } = await supabase
        .from('employee_holidays')
        .delete()
        .eq('id', leaveId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-leaves'] });
      toast({
        title: 'Success',
        description: 'Leave record deleted successfully',
      });
    },
    onError: (error) => {
      logger.error('Error deleting leave:', { error: error.message });
      toast({
        title: 'Error',
        description: 'Failed to delete leave record',
        variant: 'destructive',
      });
    },
  });

  // Group leave records by employee
  const leavesByEmployee: LeavesByEmployee = leaveRecords.reduce(
    (acc: Record<string, LeaveRecord[]>, leave: LeaveRecord) => {
      if (!acc[leave.employee_id]) {
        acc[leave.employee_id] = [];
      }
      acc[leave.employee_id].push(leave);
      return acc;
    },
    {} as Record<string, LeaveRecord[]>
  );

  // Calculate leave balances for each employee
  const calculateEmployeeBalance = (employee: Employee): LeaveBalance => {
    const employeeLeaves = leavesByEmployee[employee.id] || [];
    const daysTaken = employeeLeaves.reduce(
      (sum, leave) => sum + (leave.duration_days || 0),
      0
    );
    const defaultQuota = employee.annual_leave_quota || 21;
    const totalAvailable = calculateAccruedLeave(
      employee.start_date,
      defaultQuota
    );

    return {
      daysTaken,
      totalAvailable,
      daysRemaining: totalAvailable - daysTaken,
    };
  };

  return {
    leaveRecords,
    isLoading,
    addLeaveMutation,
    deleteLeaveMutation,
    leavesByEmployee,
    calculateEmployeeBalance,
    calculateAccruedLeave,
  };
};
