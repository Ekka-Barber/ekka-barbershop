import { AlertTriangle, Users } from 'lucide-react';
import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/components/alert-dialog';

import type { EmployeeDocumentWithStatus } from '../types';

const MAX_DOCUMENTS_TO_SHOW = 10;

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocuments: string[];
  documents: EmployeeDocumentWithStatus[];
  onConfirm: () => void;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  selectedDocuments,
  documents,
  onConfirm,
}) => {
  const selectedDocumentObjects = documents.filter((doc) =>
    doc.id !== null && selectedDocuments.includes(doc.id)
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Multiple Documents
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedDocuments.length} selected
            documents? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <h4 className="font-medium text-destructive mb-2">
              Documents to be deleted:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedDocumentObjects
                .slice(0, MAX_DOCUMENTS_TO_SHOW)
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="text-sm text-destructive flex items-center gap-2"
                  >
                    <Users className="h-3 w-3" />
                    {doc.document_name} - {doc.employee_name}
                  </div>
                ))}
              {selectedDocumentObjects.length > MAX_DOCUMENTS_TO_SHOW && (
                <div className="text-sm text-destructive font-medium">
                  ... and{' '}
                  {selectedDocumentObjects.length - MAX_DOCUMENTS_TO_SHOW} more
                  documents
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete {selectedDocuments.length} Documents
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
