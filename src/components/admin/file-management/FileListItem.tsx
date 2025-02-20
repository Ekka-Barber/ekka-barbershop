
import { Button } from "@/components/ui/button";
import { FileEndDateManager } from "./FileEndDateManager";
import { Draggable } from "@hello-pangea/dnd";

interface FileListItemProps {
  file: any;
  index: number;
  selectedStartDate: Date | undefined;
  setSelectedStartDate: (date: Date | undefined) => void;
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndDate: Date | undefined;
  setSelectedEndDate: (date: Date | undefined) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  handleEndDateUpdate: (file: any) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: any;
  deleteMutation: any;
}

export const FileListItem = ({
  file,
  index,
  selectedStartDate,
  setSelectedStartDate,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndDate,
  setSelectedEndDate,
  selectedEndTime,
  setSelectedEndTime,
  handleEndDateUpdate,
  handleRemoveEndDate,
  toggleActiveMutation,
  deleteMutation
}: FileListItemProps) => {
  return (
    <Draggable draggableId={file.id} index={index}>
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
              <FileEndDateManager
                file={file}
                selectedStartDate={selectedStartDate}
                setSelectedStartDate={setSelectedStartDate}
                selectedStartTime={selectedStartTime}
                setSelectedStartTime={setSelectedStartTime}
                selectedEndDate={selectedEndDate}
                setSelectedEndDate={setSelectedEndDate}
                selectedEndTime={selectedEndTime}
                setSelectedEndTime={setSelectedEndTime}
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
      )}
    </Draggable>
  );
};
