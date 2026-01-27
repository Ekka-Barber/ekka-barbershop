import React from 'react';

import { DynamicField } from '@shared/types/business/calculations';
import { Employee } from '@shared/types/domains';
import { Card, CardContent } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

import { EnhancedEmployeeCard } from './EnhancedEmployeeCard';
interface DeductionEditingRecord {
  id: string;
  description: string;
  amount: string;
}

interface EmployeeGridProps {
  isLoading: boolean;
  employees: Employee[];
  salesInputs: Record<string, string>;
  selectedBranch: string;
  onSalesChange: (employeeName: string, value: string) => void;
  refetchEmployees?: () => void;
  selectedMonth: string;
  monthlyDeductions: Record<string, DynamicField[]>;
  monthlyLoans: Record<string, DynamicField[]>;
  monthlyBonuses: Record<string, DynamicField[]>;

  // Salary plan assignment props
  onSalaryPlanChange?: (employeeId: string, planId: string) => void;

  // Optional props for deductions management
  deductionsFields?: Record<string, DynamicField[]>;
  onAddDeduction?: (employeeName: string) => void;
  onRemoveDeduction?: (employeeName: string, index: number) => void;
  onDeductionDescriptionChange?: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onDeductionAmountChange?: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  editingDeduction?: DeductionEditingRecord | null;
  setEditingDeduction?: (record: DeductionEditingRecord | null) => void;
  handleEditDeduction?: () => Promise<void>;
  handleDeleteDeduction?: (id: string) => Promise<void>;
  showDeductionsManagement?: boolean;
}

export const EmployeeGrid = ({
  isLoading,
  employees,
  salesInputs,
  selectedBranch,
  onSalesChange,
  refetchEmployees,
  selectedMonth,
  monthlyDeductions,
  monthlyLoans,
  monthlyBonuses,
  // Salary plan assignment props
  onSalaryPlanChange,
  // Deductions management props
  deductionsFields: _deductionsFields,
  onAddDeduction: _onAddDeduction,
  onRemoveDeduction: _onRemoveDeduction,
  onDeductionDescriptionChange: _onDeductionDescriptionChange,
  onDeductionAmountChange: _onDeductionAmountChange,
  editingDeduction: _editingDeduction,
  setEditingDeduction: _setEditingDeduction,
  handleEditDeduction: _handleEditDeduction,
  handleDeleteDeduction: _handleDeleteDeduction,
  showDeductionsManagement: _showDeductionsManagement,
}: EmployeeGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm md:text-base">
            {selectedBranch
              ? 'No employees found for the selected branch. Add employees to record sales.'
              : 'No employees found. Please select a branch or add employees to record sales.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {employees.map((employee) => (
        <EnhancedEmployeeCard
          key={employee.id}
          employee={employee}
          salesValue={salesInputs[employee.name] || ''}
          onSalesChange={(value) => onSalesChange(employee.name, value)}
          refetchEmployees={refetchEmployees}
          selectedMonth={selectedMonth}
          monthlyDeductions={monthlyDeductions[employee.name] || []}
          monthlyLoans={monthlyLoans[employee.name] || []}
          monthlyBonuses={monthlyBonuses[employee.name] || []}
          onSalaryPlanChange={onSalaryPlanChange}
        />
      ))}
    </div>
  );
};
