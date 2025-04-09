
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMonthDisplayName } from '../SalaryUtils';
import { RefreshCw, Loader2, CreditCard } from 'lucide-react';
import { MonthYearPicker } from '../../MonthYearPicker';

interface SalaryDashboardHeaderProps {
  selectedMonth: string;
  handleMonthChange: (date: Date) => void;
  pickerDate: Date;
  handleRefresh: () => void;
  isLoading: boolean;
  handleProcessPayments: () => void;
  showProcessButton: boolean;
}

export const SalaryDashboardHeader = ({
  selectedMonth,
  handleMonthChange,
  pickerDate,
  handleRefresh,
  isLoading,
  handleProcessPayments,
  showProcessButton
}: SalaryDashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">Salary Management</h2>
        <p className="text-muted-foreground">
          View and manage employee compensation for {getMonthDisplayName(selectedMonth)}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh salary data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <MonthYearPicker 
          selectedDate={pickerDate}
          onChange={handleMonthChange}
        />
        
        {showProcessButton && (
          <Button 
            onClick={handleProcessPayments}
            className="flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Process Payments
          </Button>
        )}
      </div>
    </div>
  );
};
