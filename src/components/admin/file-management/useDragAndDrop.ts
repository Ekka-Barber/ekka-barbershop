
import { useCallback } from 'react';
import { FileMetadata } from '@/types/admin';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export const useDragAndDrop = (files: FileMetadata[]) => {
  const queryClient = useQueryClient();

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination || !files) return;

    const category = result.source.droppableId.split('-')[0];
    const categoryFiles = files.filter(f => f.category === category)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const [reorderedItem] = categoryFiles.splice(result.source.index, 1);
    categoryFiles.splice(result.destination.index, 0, reorderedItem);

    const updates = categoryFiles.map((file, index) => ({
      id: file.id,
      category: file.category,
      file_name: file.file_name,
      file_path: file.file_path,
      file_type: file.file_type,
      display_order: index
    }));

    const { error } = await supabase
      .from('marketing_files')
      .upsert(updates);

    if (error) {
      console.error('Error updating order:', error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
  }, [files, queryClient]);

  return { handleDragEnd };
};
