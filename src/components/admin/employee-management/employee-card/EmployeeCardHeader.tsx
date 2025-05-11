
import { Employee } from '@/types/employee';

interface EmployeeCardHeaderProps {
  employee: Employee;
}

export const EmployeeCardHeader = ({ employee }: EmployeeCardHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      {employee.photo_url && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={employee.photo_url} 
            alt={employee.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span>{employee.name}</span>
      {employee.name_ar && (
        <span className="text-sm text-muted-foreground font-normal">
          ({employee.name_ar})
        </span>
      )}
    </div>
  );
};
