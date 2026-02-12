import React, { Suspense } from 'react';


import type { DynamicField, SalaryCalculation } from '@shared/types/business';
import type { EmployeeWithBranch } from '@shared/types/business';
import type {
  Employee,
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeLoan,
} from '@shared/types/domains';

import {
  BonusesTab,
  DeductionsTab,
  LoansTab,
  SalariesTab,
  SalesTab,
  LeaveTab,
} from '@/features/owner/employees/shared/LazyTabComponents';
import { TabLoading } from '@/features/owner/employees/shared/TabLoading';

interface UseTabRenderersProps {
  salesInputs: Record<string, string>;
  handleSalesChange: (employeeName: string, value: string) => void;
  currentEmployees: Employee[];
  saveSales: (inputs: Record<string, string>) => Promise<void>;
  selectedMonth: string;
  monthlyDeductionsRecord: Record<string, DynamicField[]>;
  monthlyLoansRecord: Record<string, DynamicField[]>;
  monthlyBonusesRecord: Record<string, DynamicField[]>;
  selectedBranch: string;
  deductionsFields: Record<string, DynamicField[]>;
  handleAddDeduction: (employeeName: string) => void;
  handleRemoveDeduction: (employeeName: string, index: number) => void;
  handleDeductionDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  handleDeductionAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveDeductions: (employeeName: string, deductions: DynamicField[]) => Promise<void>;
  typedMonthlyDeductions: EmployeeDeduction[];
  loanFields: Record<string, DynamicField[]>;
  handleAddLoan: (employeeName: string) => void;
  handleRemoveLoan: (employeeName: string, index: number) => void;
  handleLoanDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  handleLoanAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  handleLoanDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveLoans: (employeeName: string, loans: DynamicField[]) => Promise<void>;
  monthlyLoansWithType: Array<EmployeeLoan & { type: 'loan' }>;
  bonusFields: Record<string, DynamicField[]>;
  handleAddBonus: (employeeName: string) => void;
  handleRemoveBonus: (employeeName: string, index: number) => void;
  handleBonusDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  handleBonusAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  handleBonusDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveBonuses: (employeeName: string, bonuses: DynamicField[]) => Promise<void>;
  monthlyBonusesWithType: Array<EmployeeBonus & { type: 'bonus' }>;
  calculations: SalaryCalculation[];
  handleCalculate: () => void;
  // sponsors table only has name_ar column, not name
  sponsors: Array<{ id: string; name_ar: string }> | null;
  sponsorsLoading: boolean;
  // Salary plan assignment handler
  updateSalaryPlan: (employeeId: string, planId: string) => Promise<void>;
}

export const useTabRenderers = ({
  salesInputs,
  handleSalesChange,
  currentEmployees,
  saveSales,
  selectedMonth,
  monthlyDeductionsRecord,
  monthlyLoansRecord,
  monthlyBonusesRecord,
  selectedBranch,
  deductionsFields,
  handleAddDeduction,
  handleRemoveDeduction,
  handleDeductionDescriptionChange,
  handleDeductionAmountChange,
  saveDeductions,
  typedMonthlyDeductions,
  loanFields,
  handleAddLoan,
  handleRemoveLoan,
  handleLoanDescriptionChange,
  handleLoanAmountChange,
  handleLoanDateChange,
  saveLoans,
  monthlyLoansWithType,
  bonusFields,
  handleAddBonus,
  handleRemoveBonus,
  handleBonusDescriptionChange,
  handleBonusAmountChange,
  handleBonusDateChange,
  saveBonuses,
  monthlyBonusesWithType,
  calculations,
  handleCalculate,
  sponsors,
  sponsorsLoading,
  updateSalaryPlan,
}: UseTabRenderersProps): {
  renderSalesTab: () => React.ReactNode;
  renderDeductionsTab: () => React.ReactNode;
  renderLoansTab: () => React.ReactNode;
  renderBonusesTab: () => React.ReactNode;
  renderSalariesTab: () => React.ReactNode;
  renderLeaveTab: () => React.ReactNode;
} => {
  const renderSalesTab = () => (
    <Suspense fallback={<TabLoading />}>
      <SalesTab
        salesInputs={salesInputs}
        onSalesChange={handleSalesChange}
        employees={currentEmployees}
        onSubmit={saveSales}
        selectedMonth={selectedMonth}
        monthlyDeductions={monthlyDeductionsRecord}
        monthlyLoans={monthlyLoansRecord}
        monthlyBonuses={monthlyBonusesRecord}
        selectedBranch={selectedBranch}
        refetchEmployees={() => { }}
        onSalaryPlanChange={updateSalaryPlan}
      />
    </Suspense>
  );

  const renderDeductionsTab = () => (
    <Suspense fallback={<TabLoading />}>
      <DeductionsTab
        deductionsFields={deductionsFields}
        onAddDeduction={handleAddDeduction}
        onRemoveDeduction={handleRemoveDeduction}
        onDeductionDescriptionChange={handleDeductionDescriptionChange}
        onDeductionAmountChange={handleDeductionAmountChange}
        saveDeductions={saveDeductions}
        employees={currentEmployees}
        monthlyDeductions={typedMonthlyDeductions}
        selectedMonth={selectedMonth}
      />
    </Suspense>
  );

  const renderLoansTab = () => (
    <Suspense fallback={<TabLoading />}>
      <LoansTab
        loanFields={loanFields}
        onAddLoan={handleAddLoan}
        onRemoveLoan={handleRemoveLoan}
        onLoanDescriptionChange={handleLoanDescriptionChange}
        onLoanAmountChange={handleLoanAmountChange}
        onLoanDateChange={handleLoanDateChange}
        saveLoans={saveLoans}
        employees={currentEmployees}
        monthlyLoans={monthlyLoansWithType}
        selectedMonth={selectedMonth}
      />
    </Suspense>
  );

  const renderBonusesTab = () => (
    <Suspense fallback={<TabLoading />}>
      <BonusesTab
        bonusFields={bonusFields}
        onAddBonus={handleAddBonus}
        onRemoveBonus={handleRemoveBonus}
        onBonusDescriptionChange={handleBonusDescriptionChange}
        onBonusAmountChange={handleBonusAmountChange}
        onBonusDateChange={handleBonusDateChange}
        saveBonuses={saveBonuses}
        employees={currentEmployees as EmployeeWithBranch[]}
        monthlyBonuses={monthlyBonusesWithType}
        selectedMonth={selectedMonth}
      />
    </Suspense>
  );

  const renderSalariesTab = () => (
    <Suspense fallback={<TabLoading />}>
      <SalariesTab
        calculations={calculations}
        onCalculate={handleCalculate}
        selectedMonth={selectedMonth}
        monthlyDeductions={typedMonthlyDeductions}
        monthlyLoans={monthlyLoansWithType}
        monthlyBonuses={monthlyBonusesWithType}
        employees={currentEmployees as EmployeeWithBranch[]}
        sponsors={sponsors}
        isSponsorsLoading={sponsorsLoading}
      />
    </Suspense>
  );

  const renderLeaveTab = () => (
    <Suspense fallback={<TabLoading />}>
      <LeaveTab employees={currentEmployees} selectedMonth={selectedMonth} />
    </Suspense>
  );

  return {
    renderSalesTab,
    renderDeductionsTab,
    renderLoansTab,
    renderBonusesTab,
    renderSalariesTab,
    renderLeaveTab,
  };
};
