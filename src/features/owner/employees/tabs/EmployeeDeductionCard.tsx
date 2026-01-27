import React from 'react';

import { useBranches } from '@shared/hooks/useBranches';
import type {
  DynamicField,
  EmployeeDeduction,
  Employee,
} from '@shared/types/domains';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { formatPrice } from '@shared/utils/currency';

import { ExistingDeductionsSection } from './ExistingDeductionsSection';
import { NewDeductionsSection } from './NewDeductionsSection';


interface EmployeeDeductionCardProps {
  employee: Employee;
  employeeDeductions: EmployeeDeduction[];
  pendingDeductions: DynamicField[];
  totalDeductions: number;
  editingDeduction: { id: string; description: string; amount: string } | null;
  setEditingDeduction: (
    deduction: { id: string; description: string; amount: string } | null
  ) => void;
  isEditing: boolean;
  isDeletingId: string | null;
  isSavingEmployee: string | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
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
  onSaveDeductions: (employeeName: string, deductions: DynamicField[]) => void;
  onTransfer?: (deduction: EmployeeDeduction) => void;
}

export const EmployeeDeductionCard: React.FC<EmployeeDeductionCardProps> = ({
  employee,
  employeeDeductions,
  pendingDeductions,
  totalDeductions,
  editingDeduction,
  setEditingDeduction,
  isEditing,
  isDeletingId,
  isSavingEmployee,
  onEdit,
  onDelete,
  onAddDeduction,
  onRemoveDeduction,
  onDeductionDescriptionChange,
  onDeductionAmountChange,
  onSaveDeductions,
  onTransfer,
}) => {
  const { branches } = useBranches();

  // Get branch name from branch ID
  const getBranchName = (branchId: string | null) => {
    if (!branchId || !branches) return 'Not Assigned';
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name || branch.name_ar : 'Not Assigned';
  };
  return (
    <Card key={employee.id} className="h-fit">
      <CardHeader className="bg-red-50 pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              {employee.name.charAt(0).toUpperCase()}
              {employee.name.split(' ').length > 1
                ? employee.name.split(' ')[1].charAt(0).toUpperCase()
                : ''}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">
                {getBranchName(employee.branch_id)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-700">
              {formatPrice(totalDeductions)}
            </div>
            <div className="text-xs text-gray-500">Total Deductions</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Existing Deductions */}
          {employeeDeductions.length > 0 && (
            <AccordionItem value="existing">
              <AccordionTrigger className="text-sm font-medium">
                📋 Existing Deductions ({employeeDeductions.length})
              </AccordionTrigger>
              <ExistingDeductionsSection
                deductions={employeeDeductions}
                editingDeduction={editingDeduction}
                setEditingDeduction={setEditingDeduction}
                isEditing={isEditing}
                isDeletingId={isDeletingId}
                onEdit={onEdit}
                onDelete={onDelete}
                onTransfer={onTransfer}
              />
            </AccordionItem>
          )}

          {/* Add New Deductions */}
          <AccordionItem value="new">
            <AccordionTrigger className="text-sm font-medium">
              ➕ Add New Deductions ({pendingDeductions.length})
            </AccordionTrigger>
            <NewDeductionsSection
              deductions={pendingDeductions}
              onAddDeduction={onAddDeduction}
              onRemoveDeduction={onRemoveDeduction}
              onDeductionDescriptionChange={onDeductionDescriptionChange}
              onDeductionAmountChange={onDeductionAmountChange}
              onSaveDeductions={onSaveDeductions}
              employeeName={employee.name}
              isSavingEmployee={isSavingEmployee}
            />
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
