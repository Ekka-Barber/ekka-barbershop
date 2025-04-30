import { formatCurrency } from '../SalaryUtils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsProps {
  totalPayout: number;
  avgSalary: number;
  employeeCount: number;
  totalSales: number;
}

export const SalaryDashboardStats = ({ totalPayout, avgSalary, employeeCount, totalSales }: StatsProps) => {
  const payoutPercentage = totalSales > 0 ? ((totalPayout / totalSales) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Payout</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{formatCurrency(totalPayout)}</p>
              <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                ({payoutPercentage}% of sales)
              </span>
            </div>
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

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
