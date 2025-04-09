import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string; // Format: YYYY-MM
  onChange: (month: string) => void;
}

export const MonthSelector = ({ selectedMonth, onChange }: MonthSelectorProps) => {
  // Generate options for the last 12 months
  const monthOptions = React.useMemo(() => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Generate the last 12 months (including current)
    for (let i = 0; i < 12; i++) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      // Handle negative months by adjusting year
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      const monthName = new Date(targetYear, targetMonth, 1)
        .toLocaleString('en-US', { month: 'long' });
      
      const value = `${targetYear}-${(targetMonth + 1).toString().padStart(2, '0')}`;
      
      options.push({
        label: `${monthName} ${targetYear}`,
        value
      });
    }
    
    return options;
  }, []);
  
  const handleChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className="flex items-center">
      <Select value={selectedMonth} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select month" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 
