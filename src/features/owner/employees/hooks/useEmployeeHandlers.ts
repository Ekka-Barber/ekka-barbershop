import { DynamicField } from '@shared/types/business/calculations';

import { useBonusHandlers } from './useBonusHandlers';
import { useDeductionHandlers } from './useDeductionHandlers';
import { useLoanHandlers } from './useLoanHandlers';
import { useSalesHandlers } from './useSalesHandlers';

export const useEmployeeHandlers = (
  setSalesInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setDeductionsFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >,
  setBonusFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >,
  setLoanFields: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >
) => {
  const { handleSalesChange } = useSalesHandlers(setSalesInputs);
  const {
    handleAddDeduction,
    handleRemoveDeduction,
    handleDeductionDescriptionChange,
    handleDeductionAmountChange,
  } = useDeductionHandlers(setDeductionsFields);
  const {
    handleAddBonus,
    handleRemoveBonus,
    handleBonusDescriptionChange,
    handleBonusAmountChange,
    handleBonusDateChange,
  } = useBonusHandlers(setBonusFields);
  const {
    handleAddLoan,
    handleRemoveLoan,
    handleLoanDescriptionChange,
    handleLoanAmountChange,
    handleLoanDateChange,
  } = useLoanHandlers(setLoanFields);

  return {
    handleSalesChange,
    handleAddDeduction,
    handleRemoveDeduction,
    handleDeductionDescriptionChange,
    handleDeductionAmountChange,
    handleAddBonus,
    handleRemoveBonus,
    handleBonusDescriptionChange,
    handleBonusAmountChange,
    handleBonusDateChange,
    handleAddLoan,
    handleRemoveLoan,
    handleLoanDescriptionChange,
    handleLoanAmountChange,
    handleLoanDateChange,
  };
};
