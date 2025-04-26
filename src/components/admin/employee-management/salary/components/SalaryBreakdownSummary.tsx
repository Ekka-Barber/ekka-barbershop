import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../SalaryUtils';

interface SalaryBreakdownSummaryProps {
  baseSalary: number;
  commission: number;
  total: number;
}

export const SalaryBreakdownSummary = ({
  baseSalary,
  commission,
  total
}: SalaryBreakdownSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Salary Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Base Salary</div>
            <div className="text-2xl font-bold">{formatCurrency(baseSalary)}</div>
          </div>
          
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Commission</div>
            <div className="text-2xl font-bold">{formatCurrency(commission)}</div>
          </div>
          
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
