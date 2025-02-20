
import { Button } from "@/components/ui/button";
import { FileEndDateManager } from "./FileEndDateManager";
import { FileMetadata } from "@/types/admin";
import { UseMutationResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileListItemProps {
  file: FileMetadata;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<any, Error, { id: string; isActive: boolean }>;
  deleteMutation: UseMutationResult<any, Error, FileMetadata>;
}

export const FileListItem = ({
  file,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleEndDateUpdate,
  handleRemoveEndDate,
  toggleActiveMutation,
  deleteMutation
}: FileListItemProps) => {
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === file.id;
  const isToggling = toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === file.id;

  return (
    <div className="border p-4 rounded-lg space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">{file.file_name}</h3>
          <p className="text-sm text-muted-foreground">Category: {file.category}</p>
          {file.branch_name && (
            <p className="text-sm text-muted-foreground">Branch: {file.branch_name}</p>
          )}
          <FileEndDateManager
            file={file}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            handleEndDateUpdate={handleEndDateUpdate}
            handleRemoveEndDate={handleRemoveEndDate}
          />
        </div>

        {(toggleActiveMutation.error || deleteMutation.error) && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {toggleActiveMutation.error?.message || deleteMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant={file.is_active ? "default" : "outline"}
            onClick={() => toggleActiveMutation.mutate({ id: file.id, isActive: !file.is_active })}
            disabled={isToggling || isDeleting}
            className="flex-1 sm:flex-none min-w-[100px]"
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              file.is_active ? 'Active' : 'Inactive'
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(file)}
            disabled={isDeleting || isToggling}
            className="flex-1 sm:flex-none min-w-[100px]"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
