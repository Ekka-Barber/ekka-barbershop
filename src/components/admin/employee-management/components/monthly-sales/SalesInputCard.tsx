import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Employee } from '@/types/employee';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface SalesInputCardProps {
  employee: Employee;
  salesValue: string;
  onChange: (value: string) => void;
  selectedDate: Date;
}

// Format currency for display
const formatCurrency = (value: string): string => {
  const numericValue = parseInt(value, 10);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
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
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept digits (whole numbers)
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onChange(value);
      setHasChanged(true);
    }
  };

  // Format the month and year for display
  const formattedMonth = formatMonth(selectedDate);

  // Only convert to currency format if there's a valid number
  const hasValidSales = salesValue !== '' && !isNaN(parseFloat(salesValue));

  return (
    <motion.div 
      className={cn(
        "bg-card rounded-lg border shadow-sm p-4 space-y-4",
        isFocused && "ring-2 ring-primary/20",
        hasChanged && !isFocused && "border-green-200"
      )}
      whileHover={{ 
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        y: -2,
        transition: { type: "spring", stiffness: 300 }
      }}
      initial={false}
    >
      <div className="flex items-center space-x-4">
        <motion.div 
          className={cn(
            "h-12 w-12 rounded-full bg-muted flex items-center justify-center",
            "text-muted-foreground font-medium overflow-hidden"
          )}
          whileHover={{ scale: 1.05 }}
        >
          {employee.photo_url ? (
            <img 
              src={employee.photo_url} 
              alt={employee.name} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            employee.name.substring(0, 2).toUpperCase()
          )}
        </motion.div>
        <div>
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-muted-foreground">{employee.role}</div>
        </div>
      </div>
      
      <div>
        <label 
          htmlFor={`sales-${employee.id}`} 
          className="text-sm font-medium text-muted-foreground"
        >
          Sales for {formattedMonth}
        </label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id={`sales-${employee.id}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={salesValue}
            onChange={handleSalesChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0"
            className={cn(
              "pl-7 transition-all duration-200",
              isFocused && "border-primary ring-2 ring-primary/20"
            )}
          />
          
          {hasChanged && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500"
            >
              <Check className="h-4 w-4" />
            </motion.div>
          )}
        </div>
        
        {hasValidSales && (
          <motion.div 
            className="text-xs text-muted-foreground text-right mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={salesValue} // Remount on value change to trigger animation
          >
            {formatCurrency(salesValue)}
          </motion.div>
        )}
        
        {salesValue !== '' && parseInt(salesValue, 10) === 0 && (
          <motion.div 
            className="flex items-center mt-2 text-xs text-amber-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Are you sure about zero sales?</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesInputCard; 