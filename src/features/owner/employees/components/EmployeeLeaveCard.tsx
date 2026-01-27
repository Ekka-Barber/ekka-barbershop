import { format } from 'date-fns';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

import type { Employee, LeaveBalance, LeaveRecord } from '../types';

interface EmployeeLeaveCardProps {
  employee: Employee;
  balance: LeaveBalance;
  employeeLeaves: LeaveRecord[];
  defaultQuota: number;
  onDeleteLeave: (leaveId: string) => void;
  isDeletingLeave: boolean;
}

export const EmployeeLeaveCard: React.FC<EmployeeLeaveCardProps> = ({
  employee,
  balance,
  employeeLeaves,
  defaultQuota,
  onDeleteLeave,
  isDeletingLeave,
}) => {
  const handleDeleteLeave = (leaveId: string): void => {
    onDeleteLeave(leaveId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          {employee.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Start Date:{' '}
            {employee.start_date
              ? format(new Date(employee.start_date), 'MMM dd, yyyy')
              : 'Not Set'}
          </div>
          <div className="text-sm text-muted-foreground">
            Annual Leave Quota: {defaultQuota} days
          </div>
          <div className="text-sm text-muted-foreground">
            Accrued to Date: {balance.totalAvailable} days
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-xs font-medium text-green-600 dark:text-green-400">
              Available
            </p>
            <p
              className={`text-lg font-bold ${
                balance.daysRemaining >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {balance.daysRemaining}
              {balance.daysRemaining < 0 && (
                <span className="text-xs ml-1 font-normal">(overdrawn)</span>
              )}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Taken
            </p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {balance.daysTaken}
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="leave-history" className="border-none">
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              Leave History ({employeeLeaves.length})
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {employeeLeaves.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employeeLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="border rounded-lg p-3 space-y-2 relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <Badge variant="outline" className="text-xs">
                            {leave.reason}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(leave.date), 'MMM dd')} -{' '}
                            {leave.end_date
                              ? format(new Date(leave.end_date), 'MMM dd, yyyy')
                              : 'Ongoing'}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            {leave.duration_days} day
                            {leave.duration_days !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLeave(leave.id)}
                          disabled={isDeletingLeave}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No leave records found
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
