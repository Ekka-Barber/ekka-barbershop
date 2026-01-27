import { useState } from 'react';


import type { EmployeeBonus } from '@shared/types/domains';
import { TransferRecordDialog } from '@shared/ui/components/shared/TransferRecordDialog';

import {
  calculateTotalExistingBonuses,
  calculateTotalPendingBonuses,
} from '../utils/bonus-calculations';

import { BonusesTabHeader } from './BonusesTabHeader';
import { EmployeeBonusCard } from './EmployeeBonusCard';
import type { BonusesTabProps } from './types';
import { useBonusEditing } from './useBonusEditing';
import { useBonusesOperations } from './useBonusesOperations';



import { useRecordTransfer } from '@/features/owner/employees/hooks/useRecordTransfer';

export const BonusesTab = ({
  bonusFields,
  onAddBonus,
  onRemoveBonus,
  onBonusDescriptionChange,
  onBonusAmountChange,
  onBonusDateChange,
  saveBonuses,
  employees,
  monthlyBonuses = [],
  selectedMonth,
}: BonusesTabProps) => {
  const [transferRecord, setTransferRecord] = useState<EmployeeBonus | null>(null);

  const {
    editingBonus,
    startEditing,
    cancelEditing,
    updateEditingBonus,
    setEditingBonus,
  } = useBonusEditing();

  const {
    isEditing,
    isDeletingId,
    isSavingEmployee,
    handleEdit,
    handleDelete,
    handleSaveBonuses: handleSaveBonusesOp,
  } = useBonusesOperations({
    editingBonus,
    setEditingBonus,
  });

  const { transferRecord: executeTransfer, isTransferring } = useRecordTransfer();

  const handleTransfer = async (targetTable: string, targetMonth: string) => {
    if (!transferRecord) return;

    await executeTransfer(
      transferRecord,
      'employee_bonuses',
      targetTable as 'employee_deductions' | 'employee_loans',
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
      <BonusesTabHeader selectedMonth={selectedMonth} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {employees.map((employee) => {
          // Get existing bonuses for this employee
          const employeeBonuses = monthlyBonuses.filter(
            (bonus) => bonus.employee_name === employee.name
          );

          // Get pending bonuses for this employee
          const pendingBonuses = bonusFields[employee.name] || [];

          // Calculate total bonuses
          const totalExisting = calculateTotalExistingBonuses(employeeBonuses);
          const totalPending = calculateTotalPendingBonuses(pendingBonuses);
          const totalBonuses = totalExisting + totalPending;

          return (
            <EmployeeBonusCard
              key={employee.id}
              employee={employee}
              employeeBonuses={employeeBonuses}
              pendingBonuses={pendingBonuses}
              totalBonuses={totalBonuses}
              editingBonus={editingBonus}
              isEditing={isEditing}
              isDeletingId={isDeletingId}
              isSavingEmployee={isSavingEmployee}
              onAddBonus={onAddBonus}
              onRemoveBonus={onRemoveBonus}
              onBonusDescriptionChange={onBonusDescriptionChange}
              onBonusAmountChange={onBonusAmountChange}
              onBonusDateChange={onBonusDateChange}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onUpdateEditingBonus={updateEditingBonus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSaveBonuses={(employeeName, bonuses) =>
                handleSaveBonusesOp(employeeName, bonuses, saveBonuses)
              }
              onTransfer={(bonus) => setTransferRecord(bonus)}
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
        sourceTable="employee_bonuses"
        isTransferring={isTransferring}
      />
    </div>
  );
};
