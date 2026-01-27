import { useState } from 'react';

interface UseBulkStatusUpdateProps {
  selectedDocuments: string[];
  onBulkStatusUpdate: (
    documentIds: string[],
    status: string,
    notes?: string
  ) => Promise<void>;
}

export const useBulkStatusUpdate = ({
  selectedDocuments,
  onBulkStatusUpdate,
}: UseBulkStatusUpdateProps) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');

  const openStatusDialog = () => setShowStatusDialog(true);
  const closeStatusDialog = () => setShowStatusDialog(false);

  const handleBulkStatusUpdate = async () => {
    await onBulkStatusUpdate(selectedDocuments, selectedStatus, statusNotes);
    closeStatusDialog();
    setSelectedStatus('');
    setStatusNotes('');
  };

  const resetStatusForm = () => {
    setSelectedStatus('');
    setStatusNotes('');
  };

  return {
    showStatusDialog,
    selectedStatus,
    statusNotes,
    openStatusDialog,
    closeStatusDialog,
    handleBulkStatusUpdate,
    setSelectedStatus,
    setStatusNotes,
    resetStatusForm,
  };
};
