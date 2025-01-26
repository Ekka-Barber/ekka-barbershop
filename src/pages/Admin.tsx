import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PDFViewer from '@/components/PDFViewer';

const Admin = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['marketing-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .order('created_at', { ascending: false });
      
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

        const { error: dbError } = await supabase
          .from('marketing_files')
          .insert({
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            category,
            is_active: true
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900 mb-8">File Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Menu</h2>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e, 'menu')}
              className="mb-4"
              disabled={uploading}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Offers</h2>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e, 'offers')}
              className="mb-4"
              disabled={uploading}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Uploaded Files</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4">
              {files?.map((file) => (
                <div key={file.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium">{file.file_name}</h3>
                      <p className="text-sm text-gray-500">Category: {file.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={file.is_active ? "default" : "outline"}
                        onClick={() => toggleActiveMutation.mutate({ id: file.id, isActive: !file.is_active })}
                      >
                        {file.is_active ? 'Active' : 'Inactive'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(file.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;