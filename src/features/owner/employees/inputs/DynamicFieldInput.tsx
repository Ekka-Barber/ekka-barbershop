import { Trash2 } from 'lucide-react';

import { DynamicField } from '@shared/types/business/calculations';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';

interface DynamicFieldInputProps {
  field: DynamicField;
  index: number;
  onDescriptionChange: (index: number, value: string) => void;
  onAmountChange: (index: number, value: string) => void;
  onDateChange?: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  showDate?: boolean;
}

export const DynamicFieldInput = ({
  field,
  index,
  onDescriptionChange,
  onAmountChange,
  onDateChange,
  onRemove,
  showDate = false,
}: DynamicFieldInputProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 space-y-2">
        <Input
          placeholder="Description"
          value={field.description}
          onChange={(e) => onDescriptionChange(index, e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount (SAR)"
          value={field.amount}
          onChange={(e) => onAmountChange(index, e.target.value)}
        />
        {showDate && onDateChange && (
          <Input
            type="date"
            value={field.date}
            onChange={(e) => onDateChange(index, e.target.value)}
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="h-10 w-10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
