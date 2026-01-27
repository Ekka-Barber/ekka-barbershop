import { useState } from 'react';

import type { EmployeeDocumentWithStatus } from '../types';

import type { BulkEditFormData } from './types';

interface UseBulkEditProps {
  selectedDocuments: string[];
  onBulkEdit: (
    documentIds: string[],
    updates: Partial<EmployeeDocumentWithStatus>
  ) => Promise<void>;
}

export const useBulkEdit = ({
  selectedDocuments,
  onBulkEdit,
}: UseBulkEditProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<BulkEditFormData>({
    action: 'update_notifications',
  });

  const openEditDialog = () => setShowEditDialog(true);
  const closeEditDialog = () => setShowEditDialog(false);

  const handleBulkEdit = async () => {
    const updates: Partial<EmployeeDocumentWithStatus> = {};

    if (
      editFormData.action === 'update_notifications' &&
      editFormData.notification_threshold_days
    ) {
      updates.notification_threshold_days =
        editFormData.notification_threshold_days;
    }

    if (editFormData.action === 'add_notes' && editFormData.notes) {
      // For add_notes, we'd need to fetch current notes and append
      updates.notes = editFormData.notes;
    }

    if (editFormData.action === 'replace_notes') {
      updates.notes = editFormData.notes || '';
    }

    await onBulkEdit(selectedDocuments, updates);
    closeEditDialog();
    setEditFormData({ action: 'update_notifications' });
  };

  const updateFormData = (updates: Partial<BulkEditFormData>) => {
    setEditFormData((prev) => ({ ...prev, ...updates }));
  };

  return {
    showEditDialog,
    editFormData,
    openEditDialog,
    closeEditDialog,
    handleBulkEdit,
    updateFormData,
  };
};
