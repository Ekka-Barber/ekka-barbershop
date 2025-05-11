
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EmployeeDocument } from '../../../types';
import { DocumentItem } from './DocumentItem';
import { DocumentForm } from './DocumentForm';
import { useEmployeeDocuments } from '../../../hooks/useEmployeeDocuments';

interface DocumentListProps {
  employeeId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ employeeId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
  
  const { 
    documents, 
    isLoading, 
    error, 
    fetchDocuments, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    calculateStatus 
  } = useEmployeeDocuments();

  useEffect(() => {
    if (employeeId) {
      fetchDocuments(employeeId);
    }
  }, [employeeId, fetchDocuments]);

  const handleAddClick = () => {
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleEditClick = (document: EmployeeDocument) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  const handleSubmitForm = async (documentData: Partial<EmployeeDocument>) => {
    try {
      if (editingDocument?.id) {
        await updateDocument(editingDocument.id, documentData);
      } else {
        await addDocument({
          ...documentData,
          employeeId
        });
      }
      setShowForm(false);
      setEditingDocument(null);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading documents...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading documents</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Employee Documents</h3>
        <Button variant="outline" size="sm" onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <DocumentForm
              employeeId={employeeId}
              document={editingDocument || undefined}
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              isSubmitting={false}
            />
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && !showForm ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents added yet. Click "Add Document" to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <DocumentItem 
              key={document.id}
              document={document}
              statusDetails={calculateStatus(document)}
              onEdit={() => handleEditClick(document)}
              onDelete={() => handleDeleteDocument(document.id!)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 
