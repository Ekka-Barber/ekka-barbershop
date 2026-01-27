import { useState } from 'react';

interface UseBulkDeleteProps {
  selectedDocuments: string[];
  onBulkDelete: (documentIds: string[]) => Promise<void>;
}

export const useBulkDelete = ({
  selectedDocuments,
  onBulkDelete,
}: UseBulkDeleteProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const openDeleteDialog = () => setShowDeleteDialog(true);
  const closeDeleteDialog = () => setShowDeleteDialog(false);

  const handleBulkDelete = async () => {
    await onBulkDelete(selectedDocuments);
    closeDeleteDialog();
  };

  return {
    showDeleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleBulkDelete,
  };
};
