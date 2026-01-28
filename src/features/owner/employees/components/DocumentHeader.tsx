import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';

import { getDocumentsByStatus } from './document-utils';

import type { EmployeeDocumentWithStatus } from '@/features/owner/employees/types';
import type { Employee } from '@/features/owner/employees/types';

interface EmployeeWithBranch extends Employee {
  branch_name?: string;
}

interface DocumentHeaderProps {
  employee: EmployeeWithBranch;
  documents: EmployeeDocumentWithStatus[];
  selectedDocuments: (string | null)[];
  allDocsSelected: boolean;
  onDocumentSelectAll: (checked: boolean) => void;
  onAddDocument: (employeeId: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  employee,
  documents,
  allDocsSelected,
  onDocumentSelectAll,
  onAddDocument,
  isExpanded,
  onToggleExpanded,
}) => {
  const { valid, expiringSoon, expired, needsRenewal } =
    getDocumentsByStatus(documents);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Employee Selection Checkbox */}
        <Checkbox
          checked={allDocsSelected}
          onCheckedChange={onDocumentSelectAll}
          className="mt-1 w-6 h-6 sm:w-4 sm:h-4 flex-shrink-0"
        />

        {/* Employee Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg text-gray-900 truncate font-semibold">
              {employee.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {employee.branch_name || 'No Branch'}
                </span>
              </div>
              {employee.email && (
                <div className="flex items-center gap-1">
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Status Summary & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
        {/* Status Summary */}
        <div className="flex flex-wrap items-center gap-2">
          {valid.length > 0 && (
            <Badge
              variant="outline"
              className="text-green-700 border-green-300 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {valid.length} Valid
            </Badge>
          )}
          {expiringSoon.length > 0 && (
            <Badge
              variant="outline"
              className="text-yellow-700 border-yellow-300 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {expiringSoon.length} Expiring
            </Badge>
          )}
          {expired.length > 0 && (
            <Badge
              variant="outline"
              className="text-red-700 border-red-300 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {expired.length} Expired
            </Badge>
          )}
          {needsRenewal.length > 0 && (
            <Badge
              variant="outline"
              className="text-orange-700 border-orange-300 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {needsRenewal.length} Renewal
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddDocument(employee.id)}
            className="h-10 sm:h-8"
          >
            <Plus className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
            Add Document
          </Button>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
