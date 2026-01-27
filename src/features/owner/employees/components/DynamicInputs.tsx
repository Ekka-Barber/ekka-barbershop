import { useToast } from '@shared/hooks/use-toast';
import { DynamicField } from '@shared/types/business/calculations';

import { DynamicFieldInput } from '../inputs/DynamicFieldInput';
import { DynamicInputsHeader } from '../inputs/DynamicInputsHeader';

interface DynamicInputsProps {
  title: string;
  fields: DynamicField[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDescriptionChange: (index: number, value: string) => void;
  onAmountChange: (index: number, value: string) => void;
  onDateChange?: (index: number, value: string) => void;
  onSubmit: () => void;
  showDate?: boolean;
}

export const DynamicInputs = ({
  title,
  fields,
  onAdd,
  onRemove,
  onDescriptionChange,
  onAmountChange,
  onDateChange,
  onSubmit,
  showDate = false,
}: DynamicInputsProps) => {
  const { toast } = useToast();

  const handleSubmit = () => {
    // Validate fields before submission
    const isValid = fields.every(
      (field) =>
        field.description.trim() !== '' &&
        field.amount.trim() !== '' &&
        !isNaN(Number(field.amount))
    );

    if (!isValid) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in all fields with valid values before submitting.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit();
  };

  return (
    <div className="space-y-4">
      <DynamicInputsHeader
        title={title}
        onAdd={onAdd}
        onSubmit={handleSubmit}
        showSubmit={fields.length > 0}
      />
      {fields.map((field, index) => (
        <DynamicFieldInput
          key={`${field.description}-${field.amount}`}
          field={field}
          index={index}
          onDescriptionChange={onDescriptionChange}
          onAmountChange={onAmountChange}
          onDateChange={onDateChange}
          onRemove={onRemove}
          showDate={showDate}
        />
      ))}
    </div>
  );
};
