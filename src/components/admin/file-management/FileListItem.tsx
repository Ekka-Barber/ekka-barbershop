import { Button } from "@/components/ui/button";
import { FileEndDateManager } from "./FileEndDateManager";
import type { FileMetadata } from "@/types/admin";
import type { UseMutationResult } from "@tanstack/react-query";
import { Loader2, FileText, Calendar, MapPin, ToggleRight, Trash2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Draggable } from "@hello-pangea/dnd";

export interface FileListItemProps {
  file: FileMetadata;
  index: number;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<void, Error, { id: string; isActive: boolean }>;
  deleteMutation: UseMutationResult<void, Error, FileMetadata>;
}

export const FileListItem = ({
  file,
  index,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleEndDateUpdate,
  handleRemoveEndDate,
  toggleActiveMutation,
  deleteMutation
}: FileListItemProps) => {
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showEndDateDialog, setShowEndDateDialog] = useState(false);
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === file.id;
  const isToggling = toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === file.id;
  
  // Create file URL for display
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jfnjvphxhzxojxgptmtu.supabase.co";
  const fileUrl = file.file_url || `${supabaseUrl}/storage/v1/object/public/marketing_files/${file.file_path}`;
  
  const isImage = file.file_type?.toLowerCase().includes('image') || 
                  file.file_path?.toLowerCase().endsWith('.jpg') || 
                  file.file_path?.toLowerCase().endsWith('.jpeg') || 
                  file.file_path?.toLowerCase().endsWith('.png');
  
  const fileDateDisplay = file.end_date ? format(new Date(file.end_date), "PPP") : null;
  const fileTimeDisplay = file.end_date ? format(new Date(file.end_date), "HH:mm") : null;

  return (
    <Draggable draggableId={file.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`border rounded-lg overflow-hidden bg-white ${!file.is_active ? 'opacity-80' : ''}`}
        >
          <div className="flex items-start p-3 gap-3">
            {/* File preview thumbnail */}
            <div 
              className="flex-shrink-0 w-16 h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={() => setShowFilePreview(true)}
            >
              {isImage ? (
                <div className="w-full h-full">
                  <img src={fileUrl} alt={file.file_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            {/* File details */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-medium truncate">{file.file_name}</h3>
                
                <div className="mt-1 sm:mt-0 flex items-center gap-1 flex-wrap">
                  <Badge 
                    variant={file.is_active ? "default" : "outline"}
                    className="text-xs"
                  >
                    {file.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  {file.branch_name && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" /> {file.branch_name}
                    </Badge>
                  )}
                  
                  {file.is_all_branches && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" /> All Branches
                    </Badge>
                  )}
                  
                  {file.end_date && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      Expires {fileDateDisplay} {fileTimeDisplay && `at ${fileTimeDisplay}`}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={file.is_active ? "outline" : "default"}
                  onClick={() => toggleActiveMutation.mutate({ id: file.id, isActive: !file.is_active })}
                  disabled={isToggling || isDeleting}
                >
                  {isToggling ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <ToggleRight className="h-4 w-4 mr-1" />
                  )}
                  {file.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(file)}
                  disabled={isDeleting || isToggling}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
                
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </a>
              </div>
              
              {(toggleActiveMutation.error || deleteMutation.error) && (
                <Alert variant="destructive" className="mt-3">
                  <AlertDescription>
                    {toggleActiveMutation.error?.message || deleteMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <div className="bg-muted/20 border-t p-3">
            <FileEndDateManager
              file={file}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              handleEndDateUpdate={() => handleEndDateUpdate(file)}
              handleRemoveEndDate={handleRemoveEndDate}
              dialogOpen={showEndDateDialog}
              setDialogOpen={setShowEndDateDialog}
            />
          </div>
          
          {/* Full preview dialog */}
          <Dialog open={showFilePreview} onOpenChange={setShowFilePreview}>
            <DialogContent className="max-w-3xl w-[90vw] p-0 overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">{file.file_name}</h2>
              </div>
              <div className="p-4 flex items-center justify-center" style={{height: 'calc(90vh - 160px)'}}>
                {isImage ? (
                  <img 
                    src={fileUrl} 
                    alt={file.file_name} 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="h-full w-full">
                    <iframe 
                      src={fileUrl} 
                      title={file.file_name}
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};
