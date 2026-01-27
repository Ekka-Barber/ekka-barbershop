import React, { useEffect, useState } from 'react';

import { useTabNavigation } from '@shared/hooks/useTabNavigation';
import type {
  SalaryCalculation,
  DynamicField,
} from '@shared/types/business/calculations';
import type { Employee } from '@shared/types/domains';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/components/tabs';

import type { EmployeeFinancialRecords } from '../types';

import { BonusesTab } from '@/features/owner/employees/tabs/BonusesTab';
import { DeductionsTab } from '@/features/owner/employees/tabs/DeductionsTab';
import { LeaveTab } from '@/features/owner/employees/tabs/LeaveTab';
import { LoansTab } from '@/features/owner/employees/tabs/LoansTab';
import { SalariesTab } from '@/features/owner/employees/tabs/SalariesTab';
import { SalesTab } from '@/features/owner/employees/tabs/SalesTab';



interface EmployeeTabsProps {
  salesInputs: Record<string, string>;
  onSalesChange: (employeeName: string, value: string) => void;
  employees: Employee[];
  saveSales: (inputs: Record<string, string>) => void;
  selectedMonth: string;
  monthlyDeductionsRecord: EmployeeFinancialRecords;
  monthlyLoansRecord: EmployeeFinancialRecords;
  monthlyBonusesRecord: EmployeeFinancialRecords;
  selectedBranch: string;
  branchName: string;
  deductionsFields: Record<string, DynamicField[]>;
  onAddDeduction: (employeeName: string) => void;
  onRemoveDeduction: (employeeName: string, index: number) => void;
  onDeductionDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onDeductionAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveDeductions: () => void;
  monthlyDeductions: Array<{
    amount: number;
    created_at: string;
    date: string;
    description: string;
    employee_id: string;
    employee_name: string;
    id: string;
    type: string;
    updated_at: string;
  }>;
  loanFields: Record<string, DynamicField[]>;
  onAddLoan: (employeeName: string) => void;
  onRemoveLoan: (employeeName: string, index: number) => void;
  onLoanDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onLoanDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveLoans: () => void;
  monthlyLoans: Array<{
    id: string;
    employee_name: string;
    description: string;
    amount: number;
    date: string;
  }>;
  bonusFields: Record<string, DynamicField[]>;
  onAddBonus: (employeeName: string) => void;
  onRemoveBonus: (employeeName: string, index: number) => void;
  onBonusDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onBonusAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  saveBonuses: () => void;
  monthlyBonuses: Array<{
    id: string;
    employee_name: string;
    description: string;
    amount: number;
    date: string;
  }>;
  calculations: SalaryCalculation[];
  onCalculate: () => void;
  onSubmitSalaries: () => void;
}

export const EmployeeTabs: React.FC<EmployeeTabsProps> = ({
  salesInputs = {},
  onSalesChange,
  employees = [],
  saveSales,
  selectedMonth,
  monthlyDeductionsRecord,
  monthlyLoansRecord,
  monthlyBonusesRecord,
  selectedBranch,
  branchName,
  deductionsFields = {},
  onAddDeduction,
  onRemoveDeduction,
  onDeductionDescriptionChange,
  onDeductionAmountChange,
  saveDeductions,
  monthlyDeductions = [],
  loanFields = {},
  onAddLoan,
  onRemoveLoan,
  onLoanDescriptionChange,
  onLoanAmountChange,
  onLoanDateChange,
  saveLoans,
  monthlyLoans = [],
  bonusFields = {},
  onAddBonus,
  onRemoveBonus,
  onBonusDescriptionChange,
  onBonusAmountChange,
  saveBonuses,
  monthlyBonuses = [],
  calculations = [],
  onCalculate,
  onSubmitSalaries,
}) => {
  // Use URL-persisted tab navigation
  const { currentTab, setActiveTab } = useTabNavigation({
    defaultTab: 'sales',
  });

  // Force re-render trigger
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render when tab changes
  useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [currentTab]);

  // Debug logging removed for production readiness

  return (
    <Tabs
      value={currentTab}
      onValueChange={setActiveTab}
      className="w-full"
      key={`employee-tabs-${currentTab}-${renderKey}`}
    >
      <TabsList className="tabs-underline-list px-2 sm:px-3 md:px-4">
        <TabsTrigger
          value="sales"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Sales
        </TabsTrigger>
        <TabsTrigger
          value="deductions"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Deductions
        </TabsTrigger>
        <TabsTrigger
          value="loans"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Loans
        </TabsTrigger>
        <TabsTrigger
          value="bonuses"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Bonuses
        </TabsTrigger>
        <TabsTrigger
          value="salaries"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Salaries
        </TabsTrigger>
        <TabsTrigger
          value="leave"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Leave
        </TabsTrigger>
      </TabsList>
      <div className="p-3 sm:p-4 md:p-6">
        <TabsContent value="sales" className="mt-0">
          <SalesTab
            salesInputs={salesInputs}
            onSalesChange={onSalesChange}
            employees={employees}
            onSubmit={(inputs) => saveSales(inputs)}
            selectedMonth={selectedMonth}
            monthlyDeductions={monthlyDeductionsRecord}
            monthlyLoans={monthlyLoansRecord}
            monthlyBonuses={monthlyBonusesRecord}
            selectedBranch={selectedBranch}
            refetchEmployees={() => {}}
          />
        </TabsContent>
        <TabsContent value="deductions" className="mt-0">
          <DeductionsTab
            deductionsFields={deductionsFields}
            onAddDeduction={onAddDeduction}
            onRemoveDeduction={onRemoveDeduction}
            onDeductionDescriptionChange={onDeductionDescriptionChange}
            onDeductionAmountChange={onDeductionAmountChange}
            saveDeductions={saveDeductions}
            employees={employees}
            monthlyDeductions={monthlyDeductions}
            selectedMonth={selectedMonth}
          />
        </TabsContent>
        <TabsContent value="loans" className="mt-0">
          <LoansTab
            loanFields={loanFields}
            onAddLoan={onAddLoan}
            onRemoveLoan={onRemoveLoan}
            onLoanDescriptionChange={onLoanDescriptionChange}
            onLoanAmountChange={onLoanAmountChange}
            onLoanDateChange={onLoanDateChange}
            saveLoans={saveLoans}
            employees={employees}
            monthlyLoans={monthlyLoans}
            selectedMonth={selectedMonth}
          />
        </TabsContent>
        <TabsContent value="bonuses" className="mt-0">
          <BonusesTab
            bonusFields={bonusFields}
            onAddBonus={onAddBonus}
            onRemoveBonus={onRemoveBonus}
            onBonusDescriptionChange={onBonusDescriptionChange}
            onBonusAmountChange={onBonusAmountChange}
            saveBonuses={saveBonuses}
            employees={employees}
            monthlyBonuses={monthlyBonuses}
            selectedMonth={selectedMonth}
          />
        </TabsContent>
        <TabsContent value="salaries" className="mt-0">
          <SalariesTab
            calculations={calculations}
            onCalculate={onCalculate}
            onSubmitSalaries={onSubmitSalaries}
            selectedMonth={selectedMonth}
            monthlyDeductions={monthlyDeductions}
            monthlyLoans={monthlyLoans}
            monthlyBonuses={monthlyBonuses}
            selectedBranch={selectedBranch}
            branchName={branchName}
          />
        </TabsContent>
        <TabsContent value="leave" className="mt-0">
          <LeaveTab employees={employees} selectedMonth={selectedMonth} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
