import { FileText, Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/components/button';
import { Collapsible, CollapsibleContent } from '@shared/ui/components/collapsible';

import { DocumentItem } from './DocumentItem';

import type { EmployeeDocumentWithStatus } from '@/features/owner/employees/types';

interface DocumentListProps {
  documents: EmployeeDocumentWithStatus[];
  selectedDocuments: (string | null)[];
  onDocumentSelect: (documentId: string | null, selected: boolean) => void;
  onDocumentEdit: (document: EmployeeDocumentWithStatus) => void;
  onDocumentDelete: (documentId: string | null) => void;
  onAddDocument: (employeeId: string) => void;
  employeeId: string;
  isExpanded: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  onAddDocument,
  employeeId,
  isExpanded,
}) => {
  return (
    <Collapsible open={isExpanded}>
      <CollapsibleContent>
        <div className="pt-0">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No documents found for this employee</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddDocument(employeeId)}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => {
                const isSelected = selectedDocuments.includes(document.id);

                return (
                  <DocumentItem
                    key={document.id}
                    document={document}
                    isSelected={isSelected}
                    onSelect={onDocumentSelect}
                    onEdit={onDocumentEdit}
                    onDelete={onDocumentDelete}
                  />
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
