import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadSection } from './file-management/FileUploadSection';
import { FileListSection } from './file-management/FileListSection';

export const FileManagement = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("23:59");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: files, isLoading } = useQuery({
    queryKey: ['marketing-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File, category: string }) => {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('marketing_files')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const selectedBranchName = !isAllBranches && selectedBranch 
          ? branches?.find(b => b.id === selectedBranch)?.name 
          : null;

        let endDate = null;
        if (selectedDate && selectedTime) {
          const [hours, minutes] = selectedTime.split(':');
          const date = new Date(selectedDate);
          date.setHours(parseInt(hours), parseInt(minutes));
          endDate = date.toISOString();
        }

        const { error: dbError } = await supabase
          .from('marketing_files')
          .insert({
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            category,
            is_active: true,
            branch_name: selectedBranchName,
            end_date: endDate
          });

        if (dbError) throw dbError;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setSelectedBranch(null);
      setIsAllBranches(true);
      setSelectedDate(undefined);
      setSelectedTime("23:59");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "File status updated",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fileToDelete = files?.find(f => f.id === id);
      if (!fileToDelete) return;

      const { error: storageError } = await supabase.storage
        .from('marketing_files')
        .remove([fileToDelete.file_path]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('marketing_files')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    uploadMutation.mutate({ file, category });
  };

  const handleEndDateUpdate = (file: any) => {
    let endDate = null;
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const date = new Date(selectedDate);
      date.setHours(parseInt(hours), parseInt(minutes));
      endDate = date.toISOString();
    }
    
    updateEndDateMutation.mutate({ id: file.id, endDate });
  };

  const updateEndDateMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string, endDate: string | null }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ end_date: endDate })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "End date updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update end date",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const handleRemoveEndDate = (fileId: string) => {
    updateEndDateMutation.mutate({ id: fileId, endDate: null });
  };

  const handleDragEnd = async (result: any) => {
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <FileUploadSection
        branches={branches || []}
        isAllBranches={isAllBranches}
        setIsAllBranches={setIsAllBranches}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        handleFileUpload={handleFileUpload}
        uploading={uploading}
      />

      <div className="space-y-8">
        <FileListSection
          category="menu"
          files={files || []}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          handleEndDateUpdate={handleEndDateUpdate}
          handleRemoveEndDate={handleRemoveEndDate}
          toggleActiveMutation={toggleActiveMutation}
          deleteMutation={deleteMutation}
          handleDragEnd={handleDragEnd}
        />

        <FileListSection
          category="offers"
          files={files || []}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          handleEndDateUpdate={handleEndDateUpdate}
          handleRemoveEndDate={handleRemoveEndDate}
          toggleActiveMutation={toggleActiveMutation}
          deleteMutation={deleteMutation}
          handleDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};
