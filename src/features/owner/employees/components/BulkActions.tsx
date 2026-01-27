import React from 'react';

import {
  BulkActionsBar,
  BulkEditDialog,
  BulkStatusDialog,
  BulkDeleteDialog,
  useBulkActions,
} from '../bulk-actions';
import type { BulkActionsProps } from '../bulk-actions/types';

export const BulkActions: React.FC<BulkActionsProps> = (props) => {
  const {
    selectedDocuments,
    documents,
    onBulkEdit,
    onBulkDelete,
    onBulkStatusUpdate,
    onClearSelection,
    onToggleSelectAll,
    isAllSelected,
    isLoading = false,
  } = props;

  const { bulkEdit, bulkDelete, bulkStatusUpdate } = useBulkActions({
    selectedDocuments,
    onBulkEdit,
    onBulkDelete,
    onBulkStatusUpdate,
  });

  if (selectedDocuments.length === 0) return null;

  return (
    <>
      <BulkActionsBar
        selectedDocuments={selectedDocuments}
        documents={documents}
        onClearSelection={onClearSelection}
        onToggleSelectAll={onToggleSelectAll}
        isAllSelected={isAllSelected}
        isLoading={isLoading}
        onEditClick={bulkEdit.openEditDialog}
        onStatusClick={bulkStatusUpdate.openStatusDialog}
        onDeleteClick={bulkDelete.openDeleteDialog}
      />

      <BulkEditDialog
        open={bulkEdit.showEditDialog}
        onOpenChange={bulkEdit.closeEditDialog}
        selectedCount={selectedDocuments.length}
        formData={bulkEdit.editFormData}
        onFormDataChange={bulkEdit.updateFormData}
        onConfirm={bulkEdit.handleBulkEdit}
        isLoading={isLoading}
      />

      <BulkStatusDialog
        open={bulkStatusUpdate.showStatusDialog}
        onOpenChange={bulkStatusUpdate.closeStatusDialog}
        selectedCount={selectedDocuments.length}
        selectedStatus={bulkStatusUpdate.selectedStatus}
        statusNotes={bulkStatusUpdate.statusNotes}
        onStatusChange={bulkStatusUpdate.setSelectedStatus}
        onNotesChange={bulkStatusUpdate.setStatusNotes}
        onConfirm={bulkStatusUpdate.handleBulkStatusUpdate}
        isLoading={isLoading}
      />

      <BulkDeleteDialog
        open={bulkDelete.showDeleteDialog}
        onOpenChange={bulkDelete.closeDeleteDialog}
        selectedDocuments={selectedDocuments}
        documents={documents}
        onConfirm={bulkDelete.handleBulkDelete}
      />
    </>
  );
};
