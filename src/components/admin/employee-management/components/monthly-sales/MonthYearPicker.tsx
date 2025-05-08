import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthYearPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ 
  selectedDate, 
  onChange 
}) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  // Generate years (current year - 2 to current year + 5)
  const currentYearActual = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYearActual - 2 + i);
  
  const handleMonthChange = (value: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(value));
    onChange(newDate);
  };
  
  const handleYearChange = (value: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(value));
    onChange(newDate);
  };
  
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPreviousMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-2">
        <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue>{months[currentMonth]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue>{currentYear}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthYearPicker; 