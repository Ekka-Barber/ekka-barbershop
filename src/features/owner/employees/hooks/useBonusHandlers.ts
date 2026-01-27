import { DynamicField } from '@shared/types/business/calculations';

export const useBonusHandlers = (
  setBonusFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >
) => {
  const handleAddBonus = (employeeName: string) => {
    setBonusFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: [
        ...(prev[employeeName] || []),
        { id: crypto.randomUUID(), description: '', amount: '' },
      ],
    }));
  };

  const handleRemoveBonus = (employeeName: string, index: number) => {
    setBonusFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].filter((_, i) => i !== index),
    }));
  };

  const handleBonusDescriptionChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setBonusFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, description: value } : field
      ),
    }));
  };

  const handleBonusAmountChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setBonusFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, amount: value } : field
      ),
    }));
  };

  const handleBonusDateChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setBonusFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, date: value } : field
      ),
    }));
  };

  return {
    handleAddBonus,
    handleRemoveBonus,
    handleBonusDescriptionChange,
    handleBonusAmountChange,
    handleBonusDateChange,
  };
};
