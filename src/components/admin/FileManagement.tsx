import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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
      console.log('Fetching files...');
      
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

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ display_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "File order updated",
      });
    }
  });

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

  const handleRemoveEndDate = (fileId: string) => {
    updateEndDateMutation.mutate({ id: fileId, endDate: null });
  };

  const handleDragEnd = async (result: any, category: string) => {
    if (!result.destination || !files) return;

    const categoryFiles = files.filter(f => f.category === category)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const [reorderedItem] = categoryFiles.splice(result.source.index, 1);
    categoryFiles.splice(result.destination.index, 0, reorderedItem);

    // Update display order for all affected files
    const updates = categoryFiles.map((file, index) => 
      reorderMutation.mutate({ id: file.id, newOrder: index }));
    
    await Promise.all(updates);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    uploadMutation.mutate({ file, category });
  };

  const renderFileList = (category: string) => {
    if (!files) return null;

    const categoryFiles = files
      .filter(f => f.category === category)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return (
      <Droppable droppableId={`${category}-list`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {categoryFiles.map((file, index) => (
              <Draggable key={file.id} draggableId={file.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="border p-4 rounded-lg space-y-4 bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h3 className="font-medium">{file.file_name}</h3>
                        <p className="text-sm text-muted-foreground">Category: {file.category}</p>
                        {file.branch_name && (
                          <p className="text-sm text-muted-foreground">Branch: {file.branch_name}</p>
                        )}
                        {file.end_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Ends: {format(new Date(file.end_date), "PPp")}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleRemoveEndDate(file.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {!file.end_date && (
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="text-sm h-8"
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Set end date
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-[120px] h-8"
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleEndDateUpdate(file)}
                                className="h-8"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={file.is_active ? "default" : "outline"}
                          onClick={() => toggleActiveMutation.mutate({ id: file.id, isActive: !file.is_active })}
                          className="flex-1 sm:flex-none"
                        >
                          {file.is_active ? 'Active' : 'Inactive'}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(file.id)}
                          className="flex-1 sm:flex-none"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upload Menu</h2>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => handleFileUpload(e, 'menu')}
            className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            disabled={uploading}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upload Offers</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="allBranches" 
                checked={isAllBranches}
                onCheckedChange={(checked) => {
                  setIsAllBranches(checked === true);
                  if (checked) setSelectedBranch(null);
                }}
              />
              <Label htmlFor="allBranches">Available at all branches</Label>
            </div>
            
            {!isAllBranches && (
              <Select value={selectedBranch || ''} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex flex-col space-y-2">
              <Label>End Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-[240px] justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-[120px]"
                />
              </div>
            </div>
            
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e, 'offers')}
              className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={uploading || (!isAllBranches && !selectedBranch)}
            />
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={(result) => handleDragEnd(result, result.source.droppableId.split('-')[0])}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Menu Files</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              renderFileList('menu')
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Offer Files</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              renderFileList('offers')
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};
