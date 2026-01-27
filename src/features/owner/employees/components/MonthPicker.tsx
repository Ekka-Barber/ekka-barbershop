import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

interface MonthPickerProps {
  selectedMonth: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonth,
  onChange,
  isLoading = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(() =>
    selectedMonth ? parseInt(selectedMonth.split('-')[0]) : new Date().getFullYear()
  );

  const formatDisplayMonth = (monthValue: string) => {
    try {
      const date = new Date(`${monthValue}-01`);
      return format(date, 'MMMM yyyy');
    } catch {
      return monthValue;
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const year = currentYear;
    const month = String(monthIndex + 1).padStart(2, '0');
    const monthValue = `${year}-${month}`;
    onChange(monthValue);
    setIsOpen(false);
  };

  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year));
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => prev + (direction === 'next' ? 1 : -1));
  };

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-11',
            !selectedMonth && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled || isLoading}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedMonth ? (
            formatDisplayMonth(selectedMonth)
          ) : (
            <span>Select month</span>
          )}
          {isLoading && (
            <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary/80 border-t-transparent" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigateYear('prev')}
              disabled={currentYear <= 2020}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigateYear('next')}
              disabled={currentYear >= 2030}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>


          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map((month, index) => {
              const isSelected = selectedMonth === `${currentYear}-${String(index + 1).padStart(2, '0')}`;
              const isCurrentMonth = index === new Date().getMonth() && currentYear === new Date().getFullYear();

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-normal",
                    isSelected && "bg-primary text-primary-foreground",
                    isCurrentMonth && !isSelected && "ring-1 ring-accent"
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
