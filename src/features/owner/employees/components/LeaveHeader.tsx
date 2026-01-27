import type { UseMutationResult } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/components/dialog';

import type { Employee, AddLeaveData, AddLeaveResponse } from '../types';

import { AddLeaveForm } from './AddLeaveForm';
import { LeaveStats } from './LeaveStats';


interface LeaveHeaderProps {
  employees: Employee[];
  addLeaveMutation: UseMutationResult<
    AddLeaveResponse,
    Error,
    AddLeaveData,
    unknown
  >;
  selectedMonth: string;
}

export const LeaveHeader: React.FC<LeaveHeaderProps> = ({
  employees,
  selectedMonth,
  addLeaveMutation,
}) => {
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);

  const handleAddLeave = async (data: AddLeaveData) => {
    try {
      await addLeaveMutation.mutateAsync(data);
      setIsAddLeaveOpen(false);
    } catch {
      // Handle error appropriately - could be shown to user via toast
      // Error is already handled by the mutation's onError callback
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Employee Leave Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage leave requests for{' '}
            {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <Dialog open={isAddLeaveOpen} onOpenChange={setIsAddLeaveOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Leave Request</DialogTitle>
            </DialogHeader>
            <AddLeaveForm
              employees={employees}
              onSubmit={handleAddLeave}
              isLoading={addLeaveMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Total active employees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Component */}
      <LeaveStats employees={employees} selectedMonth={selectedMonth} />
    </div>
  );
};
