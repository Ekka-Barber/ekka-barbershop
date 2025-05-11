
import { formatCurrency } from '../SalaryUtils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsProps {
  totalPayout: number;
  avgSalary: number;
  employeeCount: number;
}

export const SalaryDashboardStats = ({ totalPayout, avgSalary, employeeCount }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Payout</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPayout)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Average Salary</p>
            <p className="text-2xl font-bold">{formatCurrency(avgSalary)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Employee Count</p>
            <p className="text-2xl font-bold">{employeeCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
