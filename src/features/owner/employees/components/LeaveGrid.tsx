import React from 'react';

import type { Employee, LeaveBalance, LeavesByEmployee } from '../types';

import { EmployeeLeaveCard } from './EmployeeLeaveCard';


interface LeaveGridProps {
  employees: Employee[];
  leavesByEmployee: LeavesByEmployee;
  calculateEmployeeBalance: (employee: Employee) => LeaveBalance;
  onDeleteLeave: (leaveId: string) => void;
  isDeletingLeave: boolean;
}

export const LeaveGrid: React.FC<LeaveGridProps> = ({
  employees,
  leavesByEmployee,
  calculateEmployeeBalance,
  onDeleteLeave,
  isDeletingLeave,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => {
        const balance = calculateEmployeeBalance(employee);
        const employeeLeaves = leavesByEmployee[employee.id] || [];
        const defaultQuota = employee.annual_leave_quota || 21;

        return (
          <EmployeeLeaveCard
            key={employee.id}
            employee={employee}
            balance={balance}
            employeeLeaves={employeeLeaves}
            defaultQuota={defaultQuota}
            onDeleteLeave={onDeleteLeave}
            isDeletingLeave={isDeletingLeave}
          />
        );
      })}
    </div>
  );
};
