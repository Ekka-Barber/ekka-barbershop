import { Accordion } from '@shared/ui/components/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';


import { ExistingLoansAccordion } from './ExistingLoansAccordion';
import { NewLoansAccordion } from './NewLoansAccordion';

import type { EmployeeLoanCardProps } from '@/features/owner/employees/types/loansTypes';
import { formatPrice, getEmployeeInitials } from '@/features/owner/employees/utils';

export const EmployeeLoanCard = ({
  employee,
  employeeLoans,
  pendingLoans,
  totalLoans,
  editingLoan,
  isEditing,
  isDeletingId,
  isSavingEmployee,
  onEditLoan,
  onCancelEdit,
  onSaveEdit,
  onDeleteLoan,
  onAddLoan,
  onRemoveLoan,
  onLoanDescriptionChange,
  onLoanAmountChange,
  onLoanDateChange,
  onSaveLoans,
  onEditingLoanChange,
  onTransfer,
}: EmployeeLoanCardProps) => {
  const initials = getEmployeeInitials(employee.name);

  return (
    <Card className="h-fit">
      <CardHeader className="bg-orange-50 pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">
                {employee.branches?.name || 'Unknown Branch'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-700">
              {formatPrice(totalLoans)}
            </div>
            <div className="text-xs text-gray-500">Total Loans</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <Accordion type="single" collapsible className="w-full">
          <ExistingLoansAccordion
            employeeLoans={employeeLoans}
            editingLoan={editingLoan}
            isEditing={isEditing}
            isDeletingId={isDeletingId}
            onEditLoan={onEditLoan}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDeleteLoan={onDeleteLoan}
            onEditingLoanChange={onEditingLoanChange}
            onTransfer={onTransfer}
          />

          <NewLoansAccordion
            employeeName={employee.name}
            pendingLoans={pendingLoans}
            isSavingEmployee={isSavingEmployee}
            onAddLoan={onAddLoan}
            onRemoveLoan={onRemoveLoan}
            onLoanDescriptionChange={onLoanDescriptionChange}
            onLoanAmountChange={onLoanAmountChange}
            onLoanDateChange={onLoanDateChange}
            onSaveLoans={onSaveLoans}
          />
        </Accordion>
      </CardContent>
    </Card>
  );
};
