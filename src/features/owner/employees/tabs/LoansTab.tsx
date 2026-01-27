import { useState } from 'react';

import { useLoanOperations } from '@shared/hooks';
import type { DynamicField } from '@shared/types/business';
import type { EmployeeLoan } from '@shared/types/domains';
import { TransferRecordDialog } from '@shared/ui/components/shared/TransferRecordDialog';

import { EmployeeLoanCard } from '../index';

import {
  useLoanEditing,
  useLoanSaving,
} from '@/features/owner/employees/hooks';
import { useRecordTransfer } from '@/features/owner/employees/hooks/useRecordTransfer';
import { LoansTabProps } from '@/features/owner/employees/types/loansTypes';
import { formatMonthYear } from '@/features/owner/employees/utils';



export const LoansTab = ({
  loanFields,
  onAddLoan,
  onRemoveLoan,
  onLoanDescriptionChange,
  onLoanAmountChange,
  onLoanDateChange,
  saveLoans,
  employees,
  monthlyLoans = [],
  selectedMonth,
}: LoansTabProps) => {
  const [transferRecord, setTransferRecord] = useState<EmployeeLoan | null>(null);

  const {
    editingLoan,
    isEditing,
    startEditing,
    cancelEditing,
    updateEditingLoan,
    saveEdit,
  } = useLoanEditing();
  const { deleteLoan, isDeletingId } = useLoanOperations();
  const { saveLoans: handleSaveLoans, isSavingEmployee } = useLoanSaving();
  const { transferRecord: executeTransfer, isTransferring } = useRecordTransfer();

  const handleSaveLoansWrapper = async (
    employeeName: string,
    loans: DynamicField[]
  ) => {
    await handleSaveLoans(employeeName, loans, saveLoans);
  };

  const handleTransfer = async (targetTable: string, targetMonth: string) => {
    if (!transferRecord) return;

    await executeTransfer(
      transferRecord,
      'employee_loans',
      targetTable as 'employee_deductions' | 'employee_bonuses',
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Employee Loans Management
        </h2>
        <p className="text-sm text-gray-600">
          Manage loans for{' '}
          {selectedMonth ? formatMonthYear(selectedMonth) : 'current month'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {employees.map((employee) => {
          // Get existing loans for this employee
          const employeeLoans = monthlyLoans.filter(
            (loan) => loan.employee_name === employee.name
          );

          // Get pending loans for this employee
          const pendingLoans = loanFields[employee.name] || [];

          // Calculate total loans
          const totalExisting = employeeLoans.reduce(
            (sum, l) => sum + l.amount,
            0
          );
          const totalPending = pendingLoans.reduce(
            (sum, l) => sum + parseFloat(l.amount || '0'),
            0
          );
          const totalLoans = totalExisting + totalPending;

          return (
            <EmployeeLoanCard
              key={employee.id}
              employee={employee}
              employeeLoans={employeeLoans}
              pendingLoans={pendingLoans}
              totalLoans={totalLoans}
              editingLoan={editingLoan}
              isEditing={isEditing}
              isDeletingId={isDeletingId}
              isSavingEmployee={isSavingEmployee}
              onEditLoan={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEdit={saveEdit}
              onDeleteLoan={deleteLoan}
              onAddLoan={onAddLoan}
              onRemoveLoan={onRemoveLoan}
              onLoanDescriptionChange={onLoanDescriptionChange}
              onLoanAmountChange={onLoanAmountChange}
              onLoanDateChange={onLoanDateChange}
              onSaveLoans={handleSaveLoansWrapper}
              onEditingLoanChange={updateEditingLoan}
              onTransfer={(loan) => setTransferRecord(loan)}
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
        sourceTable="employee_loans"
        isTransferring={isTransferring}
      />
    </div>
  );
};
