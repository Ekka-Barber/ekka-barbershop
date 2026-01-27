import { ArrowRightLeft, Edit2, Save, Trash2, X, Calendar, Loader2 } from 'lucide-react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';

import type { ExistingLoansAccordionProps } from '@/features/owner/employees/types/loansTypes';
import { formatPrice, formatDate } from '@/features/owner/employees/utils';


export const ExistingLoansAccordion = ({
  employeeLoans,
  editingLoan,
  isEditing,
  isDeletingId,
  onEditLoan,
  onCancelEdit,
  onSaveEdit,
  onDeleteLoan,
  onEditingLoanChange,
  onTransfer,
}: ExistingLoansAccordionProps) => {
  if (employeeLoans.length === 0) {
    return null;
  }

  return (
    <AccordionItem value="existing">
      <AccordionTrigger className="text-sm font-medium">
        📋 Existing Loans ({employeeLoans.length})
      </AccordionTrigger>
      <AccordionContent className="space-y-2">
        {employeeLoans.map((loan) => (
          <div
            key={loan.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            {editingLoan?.id === loan.id ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={editingLoan.description}
                  onChange={(e) =>
                    onEditingLoanChange({
                      ...editingLoan,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={editingLoan.amount}
                  onChange={(e) =>
                    onEditingLoanChange({
                      ...editingLoan,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Amount"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={editingLoan.date}
                  onChange={(e) =>
                    onEditingLoanChange({
                      ...editingLoan,
                      date: e.target.value,
                    })
                  }
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    className="flex-1"
                    disabled={isEditing}
                  >
                    {isEditing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    {isEditing ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                    className="flex-1"
                    disabled={isEditing}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-medium text-sm">{loan.description}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(loan.date)}
                  </div>
                  <div className="font-bold text-orange-600">
                    {formatPrice(loan.amount)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditLoan(loan)}
                    disabled={isEditing || isDeletingId === loan.id}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  {onTransfer && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onTransfer(loan)}
                      className="text-blue-600 hover:text-blue-700"
                      disabled={isEditing || isDeletingId === loan.id}
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteLoan(loan.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={isEditing || isDeletingId === loan.id}
                  >
                    {isDeletingId === loan.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};
