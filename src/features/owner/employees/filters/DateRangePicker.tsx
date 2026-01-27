import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Calendar } from '@shared/ui/components/calendar';
import { Label } from '@shared/ui/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/components/popover';

interface DateRangePickerProps {
  label: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  isOpen,
  onOpenChange,
}) => {
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const displayValue =
    startDate || endDate
      ? `${formatDisplayDate(startDate) || 'Start'} - ${formatDisplayDate(endDate) || 'End'}`
      : 'Select date range';

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) =>
                  onStartDateChange(date?.toISOString().split('T')[0] || '')
                }
                initialFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) =>
                  onEndDateChange(date?.toISOString().split('T')[0] || '')
                }
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear
              </Button>
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
