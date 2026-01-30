import type { UseMutationResult } from '@tanstack/react-query';
import React from 'react';

import { EmptyState } from '../components/EmptyState';
import { LeaveGrid } from '../components/LeaveGrid';
import { LeaveHeader } from '../components/LeaveHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type {
  LeaveTabProps,
  AddLeaveResponse,
  AddLeaveData,
} from '../types/leaveTypes';

import { useLeaveTab } from '@/features/owner/employees/hooks/useLeaveTab';



export const LeaveTab: React.FC<LeaveTabProps> = ({
  employees,
  selectedMonth,
}) => {
  const {
    leaveRecords: _leaveRecords,
    isLoading,
    addLeaveMutation,
    deleteLeaveMutation,
    leavesByEmployee,
    calculateEmployeeBalance,
    calculateAccruedLeave: _calculateAccruedLeave,
  } = useLeaveTab(selectedMonth);

  // Cast the mutation to handle the type mismatch
  const typedAddLeaveMutation = addLeaveMutation as UseMutationResult<
    AddLeaveResponse,
    Error,
    AddLeaveData,
    unknown
  >;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (employees.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <LeaveHeader
        employees={employees}
        selectedMonth={selectedMonth}
        addLeaveMutation={typedAddLeaveMutation}
      />
      <LeaveGrid
        employees={employees}
        leavesByEmployee={leavesByEmployee}
        calculateEmployeeBalance={calculateEmployeeBalance}
        onDeleteLeave={deleteLeaveMutation.mutate}
        isDeletingLeave={deleteLeaveMutation.isPending}
      />
    </div>
  );
};
