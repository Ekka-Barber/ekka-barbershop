import { ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { EmployeeBonus, EmployeeDeduction, EmployeeLoan } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';
import { formatPrice } from '@shared/utils/currency';


type TransferRecord = EmployeeDeduction | EmployeeLoan | EmployeeBonus;
type SourceTable = 'employee_deductions' | 'employee_loans' | 'employee_bonuses';
type TargetTable = 'employee_deductions' | 'employee_loans' | 'employee_bonuses';

interface TransferRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetTable: TargetTable, targetMonth: string) => Promise<void>;
  sourceRecord: TransferRecord | null;
  sourceTable: SourceTable;
  isTransferring?: boolean;
}

const TABLE_OPTIONS = [
  { value: 'employee_deductions', label: 'Deductions' },
  { value: 'employee_loans', label: 'Loans' },
  { value: 'employee_bonuses', label: 'Bonuses' },
] as const;

const MONTH_OPTIONS = [
  { value: '2024-12-01', label: 'December 2024' },
  { value: '2025-01-01', label: 'January 2025' },
  { value: '2025-02-01', label: 'February 2025' },
  { value: '2025-03-01', label: 'March 2025' },
  { value: '2025-04-01', label: 'April 2025' },
  { value: '2025-05-01', label: 'May 2025' },
  { value: '2025-06-01', label: 'June 2025' },
  { value: '2025-07-01', label: 'July 2025' },
  { value: '2025-08-01', label: 'August 2025' },
  { value: '2025-09-01', label: 'September 2025' },
  { value: '2025-10-01', label: 'October 2025' },
  { value: '2025-11-01', label: 'November 2025' },
  { value: '2025-12-01', label: 'December 2025' },
  { value: '2026-01-01', label: 'January 2026' },
] as const;

export const TransferRecordDialog = ({
  isOpen,
  onClose,
  onConfirm,
  sourceRecord,
  sourceTable,
  isTransferring = false,
}: TransferRecordDialogProps) => {

  const [targetTable, setTargetTable] = useState<TargetTable | ''>('');
  const [targetMonth, setTargetMonth] = useState('');

  // Update default month when sourceRecord changes
  useEffect(() => {
    if (sourceRecord?.date) {
      try {
        const recordDate = new Date(sourceRecord.date);
        const year = recordDate.getFullYear();
        const month = String(recordDate.getMonth() + 1).padStart(2, '0');
        const defaultMonth = `${year}-${month}-01`;
        setTargetMonth(defaultMonth);
      } catch {
        // Fallback to current month if date parsing fails
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const defaultMonth = `${year}-${month}-01`;
        setTargetMonth(defaultMonth);
      }
    } else {
      // Fallback to current month
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const defaultMonth = `${year}-${month}-01`;
      setTargetMonth(defaultMonth);
    }
  }, [sourceRecord]);

  // Don't render if no source record
  if (!sourceRecord) {
    return null;
  }

  // Get available target table options (exclude current table)
  const availableTargetTables = TABLE_OPTIONS.filter(
    (option) => option.value !== sourceTable
  );

  // Get current source table label
  const sourceTableLabel = TABLE_OPTIONS.find(
    (option) => option.value === sourceTable
  )?.label || 'Unknown';

  // Get theme colors based on source table
  const getThemeColors = () => {
    switch (sourceTable) {
      case 'employee_deductions':
        return {
          headerBg: 'bg-red-50',
          accentColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        };
      case 'employee_loans':
        return {
          headerBg: 'bg-orange-50',
          accentColor: 'text-orange-700',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
        };
      case 'employee_bonuses':
        return {
          headerBg: 'bg-green-50',
          accentColor: 'text-green-700',
          buttonColor: 'bg-green-600 hover:bg-green-700',
        };
      default:
        return {
          headerBg: 'bg-blue-50',
          accentColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const themeColors = getThemeColors();

  const handleConfirm = async () => {
    if (!targetTable || !targetMonth) return;

    try {
      await onConfirm(targetTable, targetMonth);
      onClose();
      // Reset form
      setTargetTable('');
      setTargetMonth('');
    } catch {
      // Error is handled by the parent component
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      onClose();
      setTargetTable('');
      setTargetMonth('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className={themeColors.headerBg}>
          <DialogTitle className="flex items-center gap-2 pb-2">
            <ArrowRightLeft className="h-5 w-5 text-gray-700" />
            Transfer Record
          </DialogTitle>
          <DialogDescription>
            Move this record from {sourceTableLabel.toLowerCase()} to another table.
          </DialogDescription>
        </DialogHeader>

        {/* Source Record Info */}
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
            <h4 className="font-medium text-sm text-gray-900 mb-3">Current Record</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium text-gray-900">{sourceTableLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-gray-900 truncate max-w-[150px]" title={sourceRecord.description}>
                  {sourceRecord.description}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className={`font-bold ${themeColors.accentColor}`}>
                  {formatPrice(sourceRecord.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Employee:</span>
                <span className="font-medium text-gray-900">{sourceRecord.employee_name}</span>
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Transfer to Table
              </label>
              <Select
                value={targetTable}
                onValueChange={(value) => setTargetTable(value as TargetTable)}
                disabled={isTransferring}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetTables.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Target Month
              </label>
              <Select
                value={targetMonth}
                onValueChange={setTargetMonth}
                disabled={isTransferring}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!targetTable || !targetMonth || isTransferring}
            className={`${themeColors.buttonColor} text-white flex-1`}
          >
            {isTransferring ? (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
