import { ChevronDown, X, RefreshCw, CheckCircle, Trash2 } from 'lucide-react';
import React from 'react';

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

interface DocumentBulkActionsProps {
  selectedDocuments: string[];
  documentsCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onBulkDelete: () => void;
}

export const DocumentBulkActions: React.FC<DocumentBulkActionsProps> = ({
  selectedDocuments,
  documentsCount,
  onSelectAll,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkDelete,
}) => {
  const isAllSelected =
    selectedDocuments.length === documentsCount && documentsCount > 0;

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className="border-info/60"
              />
              <span className="text-sm font-medium text-info">
                {selectedDocuments.length} selected
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-info hover:text-info/80 text-sm h-10 px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-info/40 text-info hover:bg-info/10 w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
              >
                Actions <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onBulkStatusUpdate('needs_renewal')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Mark for Renewal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkStatusUpdate('valid')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Valid
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onBulkDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
