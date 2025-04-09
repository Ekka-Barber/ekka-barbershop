
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RiyalIcon from '@/components/icons/RiyalIcon';

interface SalesInputProps {
  employeeId: string;
  salesValue: string;
  onSalesChange: (value: string) => void;
}

export const SalesInput = ({ employeeId, salesValue, onSalesChange }: SalesInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onSalesChange(value);
    }
  };

  return (
    <div>
      <Label htmlFor={`sales-${employeeId}`} className="text-sm font-medium mb-1.5 block">
        Monthly Sales Amount
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <RiyalIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          id={`sales-${employeeId}`}
          type="text"
          placeholder="Enter whole number only"
          value={salesValue}
          onChange={handleInputChange}
          className="pl-9"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
    </div>
  );
};
