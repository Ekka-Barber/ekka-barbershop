import type { BulkActionsProps } from './types';
import { useBulkDelete } from './useBulkDelete';
import { useBulkEdit } from './useBulkEdit';
import { useBulkStatusUpdate } from './useBulkStatusUpdate';


export const useBulkActions = ({
  selectedDocuments,
  onBulkEdit,
  onBulkDelete,
  onBulkStatusUpdate,
}: Pick<
  BulkActionsProps,
  'selectedDocuments' | 'onBulkEdit' | 'onBulkDelete' | 'onBulkStatusUpdate'
>) => {
  const bulkEdit = useBulkEdit({ selectedDocuments, onBulkEdit });
  const bulkDelete = useBulkDelete({ selectedDocuments, onBulkDelete });
  const bulkStatusUpdate = useBulkStatusUpdate({
    selectedDocuments,
    onBulkStatusUpdate,
  });

  const isAnyDialogOpen =
    bulkEdit.showEditDialog ||
    bulkDelete.showDeleteDialog ||
    bulkStatusUpdate.showStatusDialog;

  return {
    bulkEdit,
    bulkDelete,
    bulkStatusUpdate,
    isAnyDialogOpen,
  };
};
