import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../SalaryUtils';

interface SalaryCommissionDetailsProps {
  commission: number;
  isExpanded: boolean;
  onToggle: () => void;
  salesAmount: number;
  commissionRate?: number;
}

export const SalaryCommissionDetails = ({
  commission,
  isExpanded,
  onToggle,
  salesAmount,
  commissionRate = 0
}: SalaryCommissionDetailsProps) => {
  return (
    <Card>
      <CardHeader className="py-4 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            Commission
          </CardTitle>
          <Button variant="ghost" size="icon">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <CardDescription>Performance-based commission</CardDescription>
          <div className="text-lg font-bold">{formatCurrency(commission)}</div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sales Amount:</span>
                <span>{formatCurrency(salesAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Commission Rate:</span>
                <span>{commissionRate}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Total Commission:</span>
                <span className="font-bold">{formatCurrency(commission)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                <p>Commission is calculated using sales amount multiplied by the rate (shown as a decimal, e.g., 0.2 = 20%).</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 
