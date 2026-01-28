import { Calendar, MoreVertical } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu';


import { formatDocumentDate } from './document-utils';
import { StatusBadge } from './StatusBadge';

import { DOCUMENT_TYPES } from '@/features/owner/employees/types';
import type { EmployeeDocumentWithStatus } from '@/features/owner/employees/types';

interface DocumentItemProps {
  document: EmployeeDocumentWithStatus;
  isSelected: boolean;
  onSelect: (documentId: string | null, selected: boolean) => void;
  onEdit: (document: EmployeeDocumentWithStatus) => void;
  onDelete: (documentId: string | null) => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const documentTypeConfig =
    DOCUMENT_TYPES[document.document_type as keyof typeof DOCUMENT_TYPES] ||
    DOCUMENT_TYPES.custom;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isSelected
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Document Selection */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(document.id ?? '', checked as boolean)}
        className="w-5 h-5 sm:w-4 sm:h-4"
      />

      {/* Document Icon */}
      <div className="text-xl flex-shrink-0">{documentTypeConfig.icon}</div>

      {/* Document Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className="font-medium text-sm truncate"
            title={document.document_name ?? ''}
          >
            {document.document_name ?? ''}
          </h4>
          <StatusBadge
            status={
              document.status as
                | 'valid'
                | 'expiring_soon'
                | 'expired'
                | 'needs_renewal'
            }
            daysRemaining={document.days_remaining ?? undefined}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="truncate">{documentTypeConfig.label}</span>
            {document.document_number && (
              <span className="truncate">#{document.document_number}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Expires: {formatDocumentDate(document.expiry_date ?? '')}</span>
          </div>
        </div>

        {document.notes && (
          <p
            className="text-xs text-gray-500 mt-1 truncate"
            title={document.notes ?? ''}
          >
            Note: {document.notes ?? ''}
          </p>
        )}
      </div>

      {/* Document Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(document)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(document.id ?? '')}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
