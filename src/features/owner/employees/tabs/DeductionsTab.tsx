import { useState } from 'react';

import { useDeductionOperations } from '@shared/hooks';
import type { DynamicField } from '@shared/types/business';
import type { EmployeeDeduction, Employee } from '@shared/types/domains';
import { TransferRecordDialog } from '@shared/ui/components/shared/TransferRecordDialog';

import { EmployeeDeductionCard } from './EmployeeDeductionCard';

import { useRecordTransfer } from '@/features/owner/employees/hooks/useRecordTransfer';

interface DeductionsTabProps {
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
  saveDeductions: (employeeName: string, deductions: DynamicField[]) => void;
  employees: Employee[];
  monthlyDeductions: EmployeeDeduction[];
  selectedMonth: string;
}

export const DeductionsTab = ({
  deductionsFields,
  onAddDeduction,
  onRemoveDeduction,
  onDeductionDescriptionChange,
  onDeductionAmountChange,
  saveDeductions,
  employees,
  monthlyDeductions,
  selectedMonth,
}: DeductionsTabProps) => {
  const [isSavingEmployee, setIsSavingEmployee] = useState<string | null>(null);
  const [transferRecord, setTransferRecord] = useState<EmployeeDeduction | null>(null);

  const {
    editingDeduction,
    setEditingDeduction,
    isEditing,
    isDeletingId,
    handleEdit,
    handleDelete,
  } = useDeductionOperations();

  const { transferRecord: executeTransfer, isTransferring } = useRecordTransfer();

  const handleSaveDeductions = async (
    employeeName: string,
    deductions: DynamicField[]
  ) => {
    setIsSavingEmployee(employeeName);
    try {
      await saveDeductions(employeeName, deductions);
    } catch {
      // Error is handled by the parent component
    } finally {
      setIsSavingEmployee(null);
    }
  };

  const handleTransfer = async (targetTable: string, targetMonth: string) => {
    if (!transferRecord) {
      return;
    }

    await executeTransfer(
      transferRecord,
      'employee_deductions',
      targetTable as 'employee_loans' | 'employee_bonuses',
      targetMonth
    );
  };

  if (!employees.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No employees found for the selected branch
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Employee Deductions Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage deductions for{' '}
          {selectedMonth
            ? new Date(selectedMonth).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : 'current month'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {employees.map((employee) => {
          // Get existing deductions for this employee
          const employeeDeductions = monthlyDeductions.filter(
            (deduction) => deduction.employee_name === employee.name
          );

          // Get pending deductions for this employee
          const pendingDeductions = deductionsFields[employee.name] || [];

          // Calculate total deductions
          const totalExisting = employeeDeductions.reduce(
            (sum, d) => sum + d.amount,
            0
          );
          const totalPending = pendingDeductions.reduce(
            (sum, d) => sum + parseFloat(d.amount || '0'),
            0
          );
          const totalDeductions = totalExisting + totalPending;

          return (
            <EmployeeDeductionCard
              key={employee.id}
              employee={employee}
              employeeDeductions={employeeDeductions}
              pendingDeductions={pendingDeductions}
              totalDeductions={totalDeductions}
              editingDeduction={editingDeduction}
              setEditingDeduction={setEditingDeduction}
              isEditing={isEditing}
              isDeletingId={isDeletingId}
              isSavingEmployee={isSavingEmployee}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddDeduction={onAddDeduction}
              onRemoveDeduction={onRemoveDeduction}
              onDeductionDescriptionChange={onDeductionDescriptionChange}
              onDeductionAmountChange={onDeductionAmountChange}
              onSaveDeductions={handleSaveDeductions}
              onTransfer={(deduction) => setTransferRecord(deduction)}
            />
          );
        })}
      </div>

      {/* Transfer Record Dialog */}
      <TransferRecordDialog
        isOpen={!!transferRecord}
        onClose={() => setTransferRecord(null)}
        onConfirm={handleTransfer}
        sourceRecord={transferRecord}
        sourceTable="employee_deductions"
        isTransferring={isTransferring}
      />
    </div>
  );
};
