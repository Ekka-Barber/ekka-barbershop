import { DropResult } from '@hello-pangea/dnd';

import { FileMetadata } from '@shared/types/file-management';

export const useDragAndDrop = (files: FileMetadata[], onReorder?: (reorderedFiles: FileMetadata[]) => void) => {
  const handleDragEnd = (result: DropResult<string>) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // No change occurred
    if (source.index === destination.index) return;

    // Create a copy of the files array
    const reorderedFiles = Array.from(files);

    // Remove the item from its current position
    const [removed] = reorderedFiles.splice(source.index, 1);

    // Insert the item at its new position
    reorderedFiles.splice(destination.index, 0, removed);

    // Update display_order for all files
    const updatedFiles = reorderedFiles.map((file, index) => ({
      ...file,
      display_order: index
    }));

    // Call the onReorder callback if provided
    if (onReorder) {
      onReorder(updatedFiles);
    }
  };

  return { handleDragEnd };
};
