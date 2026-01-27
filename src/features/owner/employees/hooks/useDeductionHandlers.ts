import { DynamicField } from '@shared/types/business/calculations';

export const useDeductionHandlers = (
  setDeductionsFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >
) => {
  const handleAddDeduction = (employeeName: string) => {
    setDeductionsFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: [
        ...(prev[employeeName] || []),
        { id: crypto.randomUUID(), description: '', amount: '' },
      ],
    }));
  };

  const handleRemoveDeduction = (employeeName: string, index: number) => {
    setDeductionsFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].filter((_, i) => i !== index),
    }));
  };

  const handleDeductionDescriptionChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setDeductionsFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, description: value } : field
      ),
    }));
  };

  const handleDeductionAmountChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setDeductionsFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, amount: value } : field
      ),
    }));
  };

  return {
    handleAddDeduction,
    handleRemoveDeduction,
    handleDeductionDescriptionChange,
    handleDeductionAmountChange,
  };
};
