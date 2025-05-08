import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Employee } from '@/types/employee';

interface SalesInputCardProps {
  employee: Employee;
  salesValue: string;
  onChange: (value: string) => void;
  selectedDate: Date;
}

// Format currency as USD
const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Format month and year
const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

export const SalesInputCard: React.FC<SalesInputCardProps> = ({
  employee,
  salesValue,
  onChange,
  selectedDate
}) => {
  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept digits (whole numbers)
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onChange(value);
    }
  };

  // Format the month and year for display
  const formattedMonth = formatMonth(selectedDate);

  // Only convert to currency format if there's a valid number
  const hasValidSales = salesValue !== '' && !isNaN(parseFloat(salesValue));

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <div className={cn(
          "h-12 w-12 rounded-full bg-muted flex items-center justify-center",
          "text-muted-foreground font-medium"
        )}>
          {employee.photo_url ? (
            <img 
              src={employee.photo_url} 
              alt={employee.name} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            employee.name.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-muted-foreground">{employee.role}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label 
          htmlFor={`sales-${employee.id}`} 
          className="text-sm font-medium text-muted-foreground"
        >
          Sales for {formattedMonth}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
          <Input
            id={`sales-${employee.id}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={salesValue}
            onChange={handleSalesChange}
            placeholder="0"
            className="pl-7"
          />
        </div>
        
        {hasValidSales && (
          <div className="text-xs text-muted-foreground text-right">
            {formatCurrency(salesValue)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInputCard; 