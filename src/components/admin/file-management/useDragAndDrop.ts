import { DropResult, FileMetadata } from '@/types/file-management';

export const useDragAndDrop = (files: FileMetadata[]) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // No change occurred
    if (source.index === destination.index) return;
    
    // In a production environment, you would update the order in the database
    console.log('File was reordered:', {
      fileId: files[source.index]?.id,
      oldIndex: source.index,
      newIndex: destination.index
    });
    
    // Here you would typically make an API call to update the order
    // For example: updateFileOrderMutation.mutate({ fileId, newIndex });
  };

  return { handleDragEnd };
};
