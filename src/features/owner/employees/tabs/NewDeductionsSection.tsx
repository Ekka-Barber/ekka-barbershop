import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import React from 'react';

import type { DynamicField } from '@shared/types/business';
import { AccordionContent } from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';


interface NewDeductionsSectionProps {
  deductions: DynamicField[];
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
  employeeName: string;
  isSavingEmployee: string | null;
}

export const NewDeductionsSection: React.FC<NewDeductionsSectionProps> = ({
  deductions,
  onAddDeduction,
  onRemoveDeduction,
  onDeductionDescriptionChange,
  onDeductionAmountChange,
  onSaveDeductions,
  employeeName,
  isSavingEmployee,
}) => {
  return (
    <AccordionContent className="space-y-3">
      {deductions.map((field, index) => (
        <div
          key={field.id || `new-deduction-${employeeName}-${index}`}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Description"
              value={field.description}
              onChange={(e) =>
                onDeductionDescriptionChange(
                  employeeName,
                  index,
                  e.target.value
                )
              }
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveDeduction(employeeName, index)}
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
              onDeductionAmountChange(employeeName, index, e.target.value)
            }
          />
        </div>
      ))}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddDeduction(employeeName)}
          className="flex-1"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Deduction
        </Button>

        {deductions.length > 0 && (
          <Button
            size="sm"
            onClick={() => onSaveDeductions(employeeName, deductions)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={isSavingEmployee === employeeName}
          >
            {isSavingEmployee === employeeName ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save All
              </>
            )}
          </Button>
        )}
      </div>
    </AccordionContent>
  );
};
