import React from 'react';
import { Employee } from '@/types/employee';

interface EmployeeCardHeaderProps {
  employee: Employee;
}

export const EmployeeCardHeader = React.memo(({ employee }: EmployeeCardHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {employee.photo_url ? (
          <img 
            src={employee.photo_url} 
            alt={employee.name} 
            className="w-full h-full object-cover"
            loading="lazy"
            width={32}
            height={32}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium">
            {employee.name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span>{employee.name}</span>
      {employee.name_ar && (
        <span className="text-sm text-muted-foreground font-normal">
          ({employee.name_ar})
        </span>
      )}
    </div>
  );
});

EmployeeCardHeader.displayName = 'EmployeeCardHeader';
