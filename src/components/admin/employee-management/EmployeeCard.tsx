import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeCardHeader } from './employee-card/EmployeeCardHeader';
import { EmployeeTabs } from './employee-card/EmployeeTabs';
import { format } from 'date-fns';

interface EmployeeCardProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  refetchEmployees?: () => void;
  selectedDate?: Date;
}

export const EmployeeCard = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  refetchEmployees,
  selectedDate = new Date()
}: EmployeeCardProps) => {
  // Format selected date as YYYY-MM for month filtering
  const selectedMonth = format(selectedDate, 'yyyy-MM');
  
  console.log('EmployeeCard component with:', {
    employeeId: employee.id,
    selectedDate,
    selectedMonth
  });

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
          selectedMonth={selectedMonth}
        />
      </CardContent>
    </Card>
  );
};
