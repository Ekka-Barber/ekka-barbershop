import type { UseMutationResult } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';

import type { AddLeaveData } from '../types';

export const useAddLeaveDialog = (
  addLeaveMutation: UseMutationResult<void, Error, AddLeaveData, unknown>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('Annual Leave');
  const { toast } = useToast();

  const resetForm = (): void => {
    setSelectedEmployee('');
    setStartDate('');
    setEndDate('');
    setReason('Annual Leave');
  };

  const handleAddLeave = (): void => {
    if (!selectedEmployee || !startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = differenceInDays(end, start) + 1;

    if (durationDays <= 0) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    addLeaveMutation.mutate({
      employee_id: selectedEmployee,
      date: startDate,
      end_date: endDate,
      duration_days: durationDays,
      reason,
    });

    // Close dialog and reset form on successful mutation
    if (addLeaveMutation.isSuccess) {
      setIsOpen(false);
      resetForm();
    }
  };

  return {
    isOpen,
    setIsOpen,
    selectedEmployee,
    setSelectedEmployee,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    handleAddLeave,
    resetForm,
  };
};
