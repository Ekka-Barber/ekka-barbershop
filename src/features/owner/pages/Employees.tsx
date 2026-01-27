import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

import { useTabNavigation } from '@shared/hooks/useTabNavigation';
import { supabase } from '@shared/lib/supabase/client';
import type { EmployeeLoan, EmployeeBonus, EmployeeDeduction } from '@shared/types/domains';
import { Card } from '@shared/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/components/tabs';

import { EmployeePagination } from '@/features/owner/employees/components/EmployeePagination';
import { MonthSelector } from '@/features/owner/employees/components/MonthSelector';
import { useEmployeeData } from '@/features/owner/employees/hooks/useEmployeeData';
import { useEmployeeSales } from '@/features/owner/employees/hooks/useEmployeeSales';
import { usePaginatedEmployees } from '@/features/owner/employees/hooks/usePaginatedEmployees';
import { useTabRenderers } from '@/features/owner/employees/hooks/useTabRenderers';
import type { EmployeesProps } from '@/features/owner/employees/types/page.types';
import { getPayrollWindow, parseDateAsUTC } from '@/features/owner/employees/utils';
import { transformFinancialRecordsToRecords } from '@/features/owner/employees/utils/dataTransformers';


interface EmployeeTabsProps {
  currentTab: string;
  setActiveTab: (tab: string) => void;
  renderSalesTab: () => React.ReactNode;
  renderDeductionsTab: () => React.ReactNode;
  renderLoansTab: () => React.ReactNode;
  renderBonusesTab: () => React.ReactNode;
  renderSalariesTab: () => React.ReactNode;
  renderLeaveTab: () => React.ReactNode;
  renderDocumentsTab: () => React.ReactNode;
}

const EmployeeTabs: React.FC<EmployeeTabsProps> = ({
  currentTab,
  setActiveTab,
  renderSalesTab,
  renderDeductionsTab,
  renderLoansTab,
  renderBonusesTab,
  renderSalariesTab,
  renderLeaveTab,
  renderDocumentsTab,
}) => (
  <Card className="overflow-hidden">
    <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
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
        <TabsTrigger
          value="documents"
          className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
        >
            Documents
        </TabsTrigger>
      </TabsList>
      <div className="p-3 sm:p-4 md:p-6">
        <TabsContent value="sales" className="mt-0">
          {renderSalesTab()}
        </TabsContent>
        <TabsContent value="deductions" className="mt-0">
          {renderDeductionsTab()}
        </TabsContent>
        <TabsContent value="loans" className="mt-0">
          {renderLoansTab()}
        </TabsContent>
        <TabsContent value="bonuses" className="mt-0">
          {renderBonusesTab()}
        </TabsContent>
        <TabsContent value="salaries" className="mt-0">
          {renderSalariesTab()}
        </TabsContent>
        <TabsContent value="leave" className="mt-0">
          {renderLeaveTab()}
        </TabsContent>
        <TabsContent value="documents" className="mt-0">
          {renderDocumentsTab()}
        </TabsContent>
      </div>
    </Tabs>
  </Card>
);

// Employee content component to reduce main component size
const EmployeeContent: React.FC<EmployeesProps> = ({ selectedBranch }) => {
  const { data: employees = [], isLoading } = useEmployeeData(selectedBranch);

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sponsors').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Use URL-persisted tab navigation
  const { currentTab, setActiveTab } = useTabNavigation({
    defaultTab: 'sales',
  });

  // Get selectedMonth first from useEmployeeSales hook
  const {
    selectedMonth,
    setSelectedMonth,
    salesInputs,
    deductionsFields,
    bonusFields,
    loanFields,
    calculations,
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
    saveDeductions,
    saveBonuses,
    saveLoans,
    saveSales,
    monthlyDeductions,
    monthlyLoans,
    monthlyBonuses,
    handleCalculate,
    updateSalaryPlan,
  } = useEmployeeSales(selectedBranch);

  const { windowStart, windowEnd } = getPayrollWindow(selectedMonth);

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const empStartDate = parseDateAsUTC(emp.start_date);
      const empEndDate = parseDateAsUTC(emp.end_date);

      return (
        (!empStartDate || empStartDate <= windowEnd) &&
        (!empEndDate || empEndDate > windowStart)
      );
    });
  }, [employees, windowStart, windowEnd]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentEmployees: _currentEmployees,
    hasNextPage,
    hasPreviousPage,
  } = usePaginatedEmployees(activeEmployees);

  // Transform arrays to Records for the enhanced components
  const monthlyDeductionsRecord = transformFinancialRecordsToRecords(
    monthlyDeductions || []
  );
  const monthlyLoansRecord = transformFinancialRecordsToRecords(
    monthlyLoans || []
  );
  const monthlyBonusesRecord = transformFinancialRecordsToRecords(
    monthlyBonuses || []
  );

  // Transform financial data for components
  const typedMonthlyDeductions = (monthlyDeductions || []).map(
    (d): EmployeeDeduction & { type: 'deduction' } => ({
      ...d,
      type: 'deduction' as const,
    })
  );

  const monthlyLoansWithType = (monthlyLoans || []).map(
    (item): EmployeeLoan & { type: 'loan' } => ({
      ...item,
      type: 'loan' as const,
    })
  );

  const monthlyBonusesWithType = (monthlyBonuses || []).map(
    (item): EmployeeBonus & { type: 'bonus' } => ({
      ...item,
      type: 'bonus' as const,
    })
  );

  // Import tab renderers
  // IMPORTANT: Pass ALL active employees (not just paginated) to ensure PDF has complete data
  const {
    renderSalesTab,
    renderDeductionsTab,
    renderLoansTab,
    renderBonusesTab,
    renderSalariesTab,
    renderLeaveTab,
    renderDocumentsTab,
  } = useTabRenderers({
    salesInputs,
    handleSalesChange,
    currentEmployees: activeEmployees, // Use ALL active employees, not paginated
    selectedMonth,
    monthlyDeductionsRecord,
    monthlyLoansRecord,
    monthlyBonusesRecord,
    selectedBranch,
    saveSales,
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
  });

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="page-stack">
      <h1 className="section-title text-left">
        <span className="sm:hidden">Employee Management</span>
        <span className="hidden sm:inline">
          Employee Sales, Deductions, Loans, Bonuses & Salaries
        </span>
      </h1>

      <MonthSelector
        selectedMonth={selectedMonth}
        onChange={setSelectedMonth}
        isLoading={isLoading}
      />

      <EmployeeTabs
        currentTab={currentTab}
        setActiveTab={setActiveTab}
        renderSalesTab={renderSalesTab}
        renderDeductionsTab={renderDeductionsTab}
        renderLoansTab={renderLoansTab}
        renderBonusesTab={renderBonusesTab}
        renderSalariesTab={renderSalariesTab}
        renderLeaveTab={renderLeaveTab}
        renderDocumentsTab={renderDocumentsTab}
      />

      {totalPages > 1 && (
        <EmployeePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      )}
    </div>
  );
};

export const Employees: React.FC<EmployeesProps> = (props) => (
  <EmployeeContent {...props} />
);

export default Employees;
