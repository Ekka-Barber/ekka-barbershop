import { Building2, Briefcase } from 'lucide-react';
import React, { useMemo } from 'react';

import type { EmployeeWithBranch } from '@/features/owner/employees/types';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/components/avatar';

interface EmployeeHeaderProps {
  employee: EmployeeWithBranch;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ employee }) => {
  const branchName = useMemo(
    () => employee.branches?.name || 'Unknown Branch',
    [employee.branches?.name]
  );

  const initials = useMemo(() => {
    const names = employee.name.split(' ');
    if (names.length > 1) {
      return (
        names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
      );
    }
    return employee.name.charAt(0).toUpperCase();
  }, [employee.name]);

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Employee Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0 border border-border/60 shadow-soft">
        <AvatarImage src={employee.photo_url || undefined} alt={employee.name} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white text-lg font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Employee Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold text-lg leading-tight truncate text-foreground"
          title={employee.name}
        >
          {employee.name}
        </h3>
        <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{employee.role || 'Employee'}</span>
        </div>
        <div className="text-sm text-muted-foreground/80 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{branchName}</span>
        </div>
      </div>
    </div>
  );
};
