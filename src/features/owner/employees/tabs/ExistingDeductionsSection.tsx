import { ArrowRightLeft, Edit2, Loader2, Trash2 } from 'lucide-react';
import React from 'react';

import type { EmployeeDeduction } from '@shared/types/domains';
import { AccordionContent } from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { formatPrice } from '@shared/utils/currency';


interface ExistingDeductionsSectionProps {
  deductions: EmployeeDeduction[];
  editingDeduction: { id: string; description: string; amount: string } | null;
  setEditingDeduction: (
    deduction: { id: string; description: string; amount: string } | null
  ) => void;
  isEditing: boolean;
  isDeletingId: string | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTransfer?: (deduction: EmployeeDeduction) => void;
}

export const ExistingDeductionsSection: React.FC<
  ExistingDeductionsSectionProps
> = ({
  deductions,
  editingDeduction,
  setEditingDeduction,
  isEditing,
  isDeletingId,
  onEdit,
  onDelete,
  onTransfer,
}) => {
  if (deductions.length === 0) {
    return null;
  }

  return (
    <AccordionContent className="space-y-2">
      {deductions.map((deduction) => (
        <div
          key={deduction.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          {editingDeduction?.id === deduction.id ? (
            <div className="flex-1 space-y-2">
              <Input
                value={editingDeduction.description}
                onChange={(e) =>
                  setEditingDeduction({
                    ...editingDeduction,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="text-sm"
              />
              <Input
                type="number"
                value={editingDeduction.amount}
                onChange={(e) =>
                  setEditingDeduction({
                    ...editingDeduction,
                    amount: e.target.value,
                  })
                }
                placeholder="Amount"
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onEdit}
                  className="flex-1"
                  disabled={isEditing}
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingDeduction(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {deduction.description}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(deduction.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' at '}
                  {new Date(deduction.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="font-bold text-red-600">
                  {formatPrice(deduction.amount)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingDeduction({
                      id: deduction.id,
                      description: deduction.description,
                      amount: deduction.amount.toString(),
                    })
                  }
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                {onTransfer && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onTransfer(deduction)}
                    className="text-blue-600 hover:text-blue-700"
                    disabled={isDeletingId === deduction.id}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(deduction.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isDeletingId === deduction.id}
                >
                  {isDeletingId === deduction.id ? (
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
  );
};
