import { format } from 'date-fns';
import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';

interface EditableTableRowProps {
  id: string;
  date: string;
  type?: string;
  description: string;
  amount: string | number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTransfer?: () => void;
}

export const EditableTableRow = ({
  id,
  date,
  type,
  description,
  amount,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onDescriptionChange,
  onAmountChange,
  onTransfer,
}: EditableTableRowProps) => {
  // Format date safely with fallback
  const formattedDate = (() => {
    try {
      // Try to parse and format the date
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      // Return the original string if parsing fails
      return date;
    }
  })();

  return (
    <tr key={id}>
      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
        <span className="truncate block">{formattedDate}</span>
      </td>
      {type && (
        <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              type === 'Deduction'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {type}
          </span>
        </td>
      )}
      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
        {isEditing ? (
          <Input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full"
          />
        ) : (
          <span className="truncate block max-w-[150px] sm:max-w-none">
            {description}
          </span>
        )}
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
        {isEditing ? (
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full"
          />
        ) : (
          <span className="truncate block">{amount}</span>
        )}
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex space-x-1 sm:space-x-2 justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-1 sm:p-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {onTransfer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTransfer}
                className="p-1 sm:p-2 text-blue-600 hover:text-blue-700"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="p-1 sm:p-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};
