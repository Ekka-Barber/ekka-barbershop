import { Edit, Trash2, RefreshCw, ChevronDown, X } from 'lucide-react';
import React from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Checkbox } from '@shared/ui/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu';

import type { EmployeeDocumentWithStatus } from '../types';

import {
  getStatusStats,
  getStatusOption,
  getSelectionText,
  shouldShowDocumentPreview,
} from './utils';


interface BulkActionsBarProps {
  selectedDocuments: string[];
  documents: EmployeeDocumentWithStatus[];
  onClearSelection: () => void;
  onToggleSelectAll: (documents: EmployeeDocumentWithStatus[]) => void;
  isAllSelected: boolean;
  isLoading?: boolean;
  onEditClick: () => void;
  onStatusClick: () => void;
  onDeleteClick: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedDocuments,
  documents,
  onClearSelection,
  onToggleSelectAll,
  isAllSelected,
  isLoading = false,
  onEditClick,
  onStatusClick,
  onDeleteClick,
}) => {
  const statusStats = getStatusStats(selectedDocuments, documents);
  const selectedDocumentObjects = documents.filter((doc) =>
    doc.id !== null && selectedDocuments.includes(doc.id)
  );

  return (
    <Card className="mb-4 bg-info/10 border-info/20">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={() => onToggleSelectAll(documents)}
                className="border-info/60"
              />
              <span className="font-medium text-info">
                {getSelectionText(selectedDocuments.length)}
              </span>
            </div>

            {/* Status Summary */}
            <div className="flex items-center gap-2">
              {Object.entries(statusStats).map(([status, count]) => {
                const statusOption = getStatusOption(status);
                if (!statusOption) return null;

                return (
                  <Badge key={status} variant="outline" className="text-xs">
                    <statusOption.icon
                      className={`h-3 w-3 mr-1 ${statusOption.color}`}
                    />
                    {count} {statusOption.label}
                  </Badge>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-info hover:text-info/80"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-info/40 text-info hover:bg-info/10"
                >
                  Bulk Actions <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onStatusClick}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selected Documents Preview */}
        {shouldShowDocumentPreview(selectedDocuments.length) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedDocumentObjects.map((doc) => (
              <Badge key={doc.id} variant="secondary" className="text-xs">
                {doc.document_name} ({doc.employee_name})
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
