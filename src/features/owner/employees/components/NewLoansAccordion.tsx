import { Plus, Save, Trash2, Loader2 } from 'lucide-react';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';

import { NewLoansAccordionProps } from '@/features/owner/employees/types/loansTypes';

export const NewLoansAccordion = ({
  employeeName,
  pendingLoans,
  isSavingEmployee,
  onAddLoan,
  onRemoveLoan,
  onLoanDescriptionChange,
  onLoanAmountChange,
  onLoanDateChange,
  onSaveLoans,
}: NewLoansAccordionProps) => {
  return (
    <AccordionItem value="new">
      <AccordionTrigger className="text-sm font-medium">
        ➕ Add New Loans ({pendingLoans.length})
      </AccordionTrigger>
      <AccordionContent className="space-y-3">
        {pendingLoans.map((field, index) => (
          <div
            key={field.id || `new-loan-${employeeName}-${index}`}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Description"
                value={field.description}
                onChange={(e) =>
                  onLoanDescriptionChange(employeeName, index, e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveLoan(employeeName, index)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="number"
              placeholder="Amount (SAR)"
              value={field.amount}
              onChange={(e) =>
                onLoanAmountChange(employeeName, index, e.target.value)
              }
            />
            <Input
              type="date"
              value={field.date}
              onChange={(e) =>
                onLoanDateChange(employeeName, index, e.target.value)
              }
              className="w-full"
            />
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddLoan(employeeName)}
            className="flex-1"
            disabled={isSavingEmployee === employeeName}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Loan
          </Button>

          {pendingLoans.length > 0 && (
            <Button
              size="sm"
              onClick={() => onSaveLoans(employeeName, pendingLoans)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSavingEmployee === employeeName}
            >
              {isSavingEmployee === employeeName ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Save className="w-3 h-3 mr-1" />
              )}
              {isSavingEmployee === employeeName ? 'Saving...' : 'Save All'}
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
