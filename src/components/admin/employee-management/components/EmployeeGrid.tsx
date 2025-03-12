
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
          <Card key={i} className="overflow-hidden h-full">
            <CardContent className="p-0">
              <div className="h-14 bg-primary/5 mb-4">
                <div className="flex items-center p-4 gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (employees.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/10">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-2">
            {selectedBranch 
              ? "No employees found for the selected branch." 
              : "Please select a branch to view employees."}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedBranch && "Add employees to this branch to record sales."}
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
