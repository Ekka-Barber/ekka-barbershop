
import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthYearPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const MonthYearPicker = ({ selectedDate, onChange }: MonthYearPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePreviousMonth = () => {
    onChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(selectedDate, 1));
  };

  // Disable future months
  const isCurrentMonth = format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
  const isFutureMonth = selectedDate > new Date();

  return (
    <div className="flex items-center border rounded-md bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePreviousMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="px-2 py-1 font-medium">
        {format(selectedDate, 'MMMM yyyy')}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        disabled={isCurrentMonth || isFutureMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
