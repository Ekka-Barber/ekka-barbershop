
import { Button } from "@/components/ui/button";
import { FileEndDateManager } from "./FileEndDateManager";

interface FileListItemProps {
  file: any;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: any) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: any;
  deleteMutation: any;
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
  return (
    <div className="border p-4 rounded-lg space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
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
  );
};
