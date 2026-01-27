export const useSalesHandlers = (
  setSalesInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const handleSalesChange = (employeeName: string, value: string) => {
    setSalesInputs((prev: Record<string, string>) => ({
      ...prev,
      [employeeName]: value,
    }));
  };

  return {
    handleSalesChange,
  };
};
