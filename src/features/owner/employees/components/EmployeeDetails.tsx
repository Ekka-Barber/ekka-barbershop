import { format } from 'date-fns';
import { Calendar, Mail } from 'lucide-react';
import React, { useMemo } from 'react';

import type { EmployeeWithBranch } from '@/features/owner/employees/types';
import { Badge } from '@shared/ui/components/badge';

interface EmployeeDetailsProps {
  employee: EmployeeWithBranch;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
}) => {
  const formattedStartDate = useMemo(
    () =>
      employee.created_at
        ? format(new Date(employee.created_at), 'MMM d, yyyy')
        : 'Not set',
    [employee.created_at]
  );

  const salaryPlanName = useMemo(
    () => employee.branches?.name || 'No Salary Plan',
    [employee.branches?.name]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">Started:</span>
        <span className="font-medium">{formattedStartDate}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Mail className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">Salary Plan:</span>
        <Badge variant="outline" className="text-xs">
          {salaryPlanName}
        </Badge>
      </div>
    </div>
  );
};
