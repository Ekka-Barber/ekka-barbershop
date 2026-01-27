import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Label } from '@shared/ui/components/label';

import { MonthPicker } from './MonthPicker';

interface MonthSelectorProps {
  selectedMonth: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const MonthSelector = ({
  selectedMonth,
  onChange,
  isLoading = false,
}: MonthSelectorProps) => {
  const formatDisplayMonth = (monthValue: string) => {
    try {
      const date = new Date(`${monthValue}-01`);
      return format(date, 'MMMM yyyy');
    } catch {
      return monthValue;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!selectedMonth || isLoading) return;

    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr);
    let month = parseInt(monthStr);

    if (direction === 'next') {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    } else {
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
    }

    const newMonthValue = `${year}-${String(month).padStart(2, '0')}`;
    onChange(newMonthValue);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="month" className="text-sm font-medium text-foreground">
              Select Month
            </Label>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 shrink-0"
                onClick={() => navigateMonth('prev')}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onChange={onChange}
                  isLoading={isLoading}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 shrink-0"
                onClick={() => navigateMonth('next')}
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Currently viewing:</span>
              <span className="font-medium text-primary">
                {formatDisplayMonth(selectedMonth)}
              </span>
              {isLoading && (
                <span className="text-warning">??? Refreshing data...</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
