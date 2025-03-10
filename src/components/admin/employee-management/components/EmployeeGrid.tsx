
import { Employee } from '@/types/employee';
import { EmployeeCard } from '../EmployeeCard';
import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  console.log('EmployeeGrid render:', { isLoading, employeesCount: employees.length });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
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
