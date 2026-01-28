import { AlertTriangle, Loader2 } from 'lucide-react';
import React from 'react';

import { Alert, AlertDescription } from '@shared/ui/components/alert';
import { Button } from '@shared/ui/components/button';

import { EmployeeDocumentsList, DocumentForm } from '../index';
import type { DocumentsTabProps } from '../types';

import { DocumentActionBar } from './DocumentActionBar';
import { DocumentBulkActions } from './DocumentBulkActions';
import { DocumentFilters } from './DocumentFilters';
import { DocumentSummaryCards } from './DocumentSummaryCards';
import { useDocumentFilters } from './useDocumentFilters';
import { useDocumentOperations } from './useDocumentOperations';

import { useEmployeeDocuments } from '@/features/owner/employees/hooks/useEmployeeDocuments';


export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  employees,
  selectedMonth: _selectedMonth,
}) => {
  // Use the new hooks
  const {
    filters,
    searchTerm,
    handleEmployeeFilterChange,
    handleDocumentTypeFilterChange,
    handleStatusFilterChange,
    handleSearchChange,
    clearAllFilters,
    removeFilter,
  } = useDocumentFilters(employees);

  const {
    documents,
    isLoading,
    error,
    clearError,
    getExpiringDocuments,
    getExpiredDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    isCreating,
    isUpdating,
  } = useEmployeeDocuments({ ...filters, searchTerm });

  const {
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
  } = useDocumentOperations({
    createDocument,
    updateDocument,
    deleteDocument,
  });

  // Get summary statistics
  const expiringDocuments = getExpiringDocuments();
  const expiredDocuments = getExpiredDocuments();
  const validDocuments = documents.filter((doc) => doc.status === 'valid');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading employee documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Document Filters */}
      <DocumentFilters
        filters={filters}
        searchTerm={searchTerm}
        employees={employees}
        onEmployeeFilterChange={handleEmployeeFilterChange}
        onDocumentTypeFilterChange={handleDocumentTypeFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSearchChange={handleSearchChange}
        onClearAllFilters={clearAllFilters}
        onRemoveFilter={removeFilter}
      />

      {/* Bulk Actions */}
      <DocumentBulkActions
        selectedDocuments={selectedDocuments}
        documentsCount={documents.length}
        onSelectAll={() => handleSelectAll(documents)}
        onClearSelection={clearSelection}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkDelete={handleBulkDelete}
      />

      {/* Summary Cards */}
      <DocumentSummaryCards
        totalDocuments={documents.length}
        validDocuments={validDocuments.length}
        expiringDocuments={expiringDocuments.length}
        expiredDocuments={expiredDocuments.length}
      />

      {/* Action Bar */}
      <DocumentActionBar
        selectedDocumentsCount={selectedDocuments.length}
        onAddDocument={() => handleAddDocument()}
        onUseTemplate={() => handleAddDocument()}
      />

      {/* Employee Documents List */}
      <EmployeeDocumentsList
        employees={employees}
        documents={documents}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={handleDocumentSelection}
        onDocumentEdit={handleEditDocument}
        onDocumentDelete={handleDeleteDocument}
        onAddDocument={handleAddDocument}
        isLoading={isLoading}
        className="space-y-3"
      />

      {/* Document Form */}
      {showForm && (
        <DocumentForm
          employees={employees}
          document={editingDocument}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isCreating || isUpdating}
          open={showForm}
        />
      )}
    </div>
  );
};
