
import { Employee } from '@/types/employee';
import { EmployeeCard } from '../EmployeeCard';
import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle } from 'lucide-react';

interface EmployeeGridProps {
  isLoading: boolean;
  employees: Employee[];
  salesInputs: Record<string, string>;
  selectedBranch: string | null;
  onSalesChange: (employeeId: string, value: string) => void;
}

export const EmployeeGrid = ({
  isLoading,
  employees,
  salesInputs,
  selectedBranch,
  onSalesChange
}: EmployeeGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {selectedBranch 
              ? "No employees found for the selected branch. Add employees to record sales." 
              : "No employees found. Please select a branch or add employees to record sales."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map(employee => (
        <EmployeeCard 
          key={employee.id}
          employee={employee}
          salesValue={salesInputs[employee.id] || ''}
          onSalesChange={(value) => onSalesChange(employee.id, value)}
        />
      ))}
    </div>
  );
};
