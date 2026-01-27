import { Calendar, Users, Clock } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

import type { Employee } from '../types';

interface LeaveStatsProps {
  employees: Employee[];
  selectedMonth: string;
}

export const LeaveStats: React.FC<LeaveStatsProps> = ({
  employees,
  selectedMonth,
}) => {
  const totalEmployees = employees.length;
  const averageLeaveQuota =
    employees.reduce((sum, emp) => sum + (emp.annual_leave_quota || 21), 0) /
    totalEmployees;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">Active employees</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Leave Quota
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(averageLeaveQuota)}
          </div>
          <p className="text-xs text-muted-foreground">Days per year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Period</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <p className="text-xs text-muted-foreground">Selected month</p>
        </CardContent>
      </Card>
    </div>
  );
};
