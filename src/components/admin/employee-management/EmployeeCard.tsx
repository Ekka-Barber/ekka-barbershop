
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeCardHeader } from './employee-card/EmployeeCardHeader';
import { EmployeeTabs } from './employee-card/EmployeeTabs';

// Import the missing components
import { SalesStatistics } from './components/SalesStatistics';
import { SalaryPlanSection } from './components/SalaryPlanSection';
// Add these to EmployeeTabContent.tsx at the top when it's processed

interface EmployeeCardProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  refetchEmployees?: () => void;
}

export const EmployeeCard = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  refetchEmployees
}: EmployeeCardProps) => {
  // Fetch branches for branch selection
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-for-employee-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-muted/30 pb-3">
        <CardTitle className="text-lg font-semibold">
          <EmployeeCardHeader employee={employee} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <EmployeeTabs
          employee={employee}
          salesValue={salesValue}
          onSalesChange={onSalesChange}
          branches={branches}
          refetchEmployees={refetchEmployees}
        />
      </CardContent>
    </Card>
  );
};
