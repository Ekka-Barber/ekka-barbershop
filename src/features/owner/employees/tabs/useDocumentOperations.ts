import { useState, useCallback } from 'react';

import type { EmployeeDocumentWithStatus, DocumentFormData } from '../../types';

interface DocumentOperationsProps {
  createDocument: (data: Partial<DocumentFormData>) => Promise<void>;
  updateDocument: (params: {
    id: string;
    updates: Partial<DocumentFormData>;
  }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentOperations = ({
  createDocument,
  updateDocument,
  deleteDocument,
}: DocumentOperationsProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<EmployeeDocumentWithStatus | null>(null);

  const handleDocumentSelection = useCallback(
    (documentId: string, selected: boolean) => {
      if (selected) {
        setSelectedDocuments((prev) => [...prev, documentId]);
      } else {
        setSelectedDocuments((prev) => prev.filter((id) => id !== documentId));
      }
    },
    []
  );

  const handleSelectAll = useCallback(
    (documents: EmployeeDocumentWithStatus[]) => {
      const isAllSelected =
        selectedDocuments.length === documents.length && documents.length > 0;
      if (isAllSelected) {
        setSelectedDocuments([]);
      } else {
        setSelectedDocuments(
          documents
            .map((doc) => doc.id)
            .filter((id): id is string => id !== null)
        );
      }
    },
    [selectedDocuments.length]
  );

  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  const handleAddDocument = useCallback((employeeId?: string) => {
    setEditingDocument(null);
    setShowForm(true);
    // If employeeId is provided, we can pre-select it in the form
    if (employeeId) {
      // This will be handled in the form component
    }
  }, []);

  const handleEditDocument = useCallback(
    (document: EmployeeDocumentWithStatus) => {
      setEditingDocument(document);
      setShowForm(true);
    },
    []
  );

  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      try {
        await deleteDocument(documentId);
        // Remove from selection if selected
        setSelectedDocuments((prev) => prev.filter((id) => id !== documentId));
      } catch {
        // Error handling is managed by the hook
      }
    },
    [deleteDocument]
  );

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(selectedDocuments.map((id) => deleteDocument(id)));
      setSelectedDocuments([]);
    } catch {
      // Error handling is managed by the hook
    }
  }, [selectedDocuments, deleteDocument]);

  const handleBulkStatusUpdate = useCallback((_status: string) => {
    try {
      // This would require implementing bulk update in the hook
      // Bulk updating documents to status: ${status}
      // For now, just clear selection
      setSelectedDocuments([]);
    } catch {
      // Error handling is managed by the hook
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: Partial<DocumentFormData>) => {
      try {
        if (editingDocument) {
          await updateDocument({
            id: editingDocument.id!,
            updates: formData,
          });
        } else {
          await createDocument(formData);
        }
        setShowForm(false);
        setEditingDocument(null);
      } catch {
        // Error handling is managed by the hook
      }
    },
    [editingDocument, updateDocument, createDocument]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingDocument(null);
  }, []);

  return {
    selectedDocuments,
    showForm,
    editingDocument,
    handleDocumentSelection,
    handleSelectAll,
    clearSelection,
    handleAddDocument,
    handleEditDocument,
    handleDeleteDocument,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleFormSubmit,
    handleFormCancel,
  };
};
