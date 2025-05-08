import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  profilePicture?: string;
  role: string;
  branchId: string;
  email?: string;
  phone?: string;
}

interface SalesInputCardProps {
  employee: Employee;
  salesValue: number;
  onChange: (value: number) => void;
  selectedDate: Date;
}

// Format currency as USD
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
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
    // Convert to number and validate
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onChange(value);
    }
  };

  // Format the month and year for display
  const formattedMonth = formatMonth(selectedDate);

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <div className={cn(
          "h-12 w-12 rounded-full bg-muted flex items-center justify-center",
          "text-muted-foreground font-medium"
        )}>
          {employee.profilePicture ? (
            <img 
              src={employee.profilePicture} 
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
            type="number"
            value={salesValue === 0 ? '' : salesValue}
            onChange={handleSalesChange}
            placeholder="0.00"
            className="pl-7"
            min="0"
            step="0.01"
          />
        </div>
        
        {salesValue > 0 && (
          <div className="text-xs text-muted-foreground text-right">
            {formatCurrency(salesValue)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInputCard; 