import { DynamicField } from '@shared/types/business/calculations';

export const useLoanHandlers = (
  setLoanFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >
) => {
  const handleAddLoan = (employeeName: string) => {
    setLoanFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: [
        ...(prev[employeeName] || []),
        { id: crypto.randomUUID(), description: '', amount: '' },
      ],
    }));
  };

  const handleRemoveLoan = (employeeName: string, index: number) => {
    setLoanFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].filter((_, i) => i !== index),
    }));
  };

  const handleLoanDescriptionChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setLoanFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, description: value } : field
      ),
    }));
  };

  const handleLoanAmountChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setLoanFields((prev: Record<string, DynamicField[]>) => ({
      ...prev,
      [employeeName]: prev[employeeName].map((field, i) =>
        i === index ? { ...field, amount: value } : field
      ),
    }));
  };

  const handleLoanDateChange = (
    employeeName: string,
    index: number,
    value: string
  ) => {
    setLoanFields((prev) => {
      const employeeLoans = [...(prev[employeeName] || [])];
      if (employeeLoans[index]) {
        employeeLoans[index] = { ...employeeLoans[index], date: value };
      }
      return { ...prev, [employeeName]: employeeLoans };
    });
  };

  return {
    handleAddLoan,
    handleRemoveLoan,
    handleLoanDescriptionChange,
    handleLoanAmountChange,
    handleLoanDateChange,
  };
};
