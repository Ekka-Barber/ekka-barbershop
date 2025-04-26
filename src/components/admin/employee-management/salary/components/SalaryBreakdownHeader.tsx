import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { getMonthDisplayName } from '../SalaryUtils';

interface SalaryBreakdownHeaderProps {
  employeeName: string;
  selectedMonth: string;
  onBack: () => void;
}

export const SalaryBreakdownHeader = ({
  employeeName,
  selectedMonth,
  onBack
}: SalaryBreakdownHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{employeeName}</h2>
          <div className="flex items-center text-muted-foreground text-sm">
            <CalendarDays className="mr-1 h-4 w-4" />
            <span>Salary Breakdown for {getMonthDisplayName(selectedMonth)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 
