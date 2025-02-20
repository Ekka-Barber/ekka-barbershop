
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { FileListItem } from "./FileListItem";
import { FileMetadata } from '@/types/admin';
import { UseMutationResult } from '@tanstack/react-query';

interface FileListSectionProps {
  category: string;
  files: FileMetadata[];
  selectedStartDate: Date | undefined;
  setSelectedStartDate: (date: Date | undefined) => void;
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndDate: Date | undefined;
  setSelectedEndDate: (date: Date | undefined) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<any, Error, any>;
  deleteMutation: UseMutationResult<any, Error, any>;
  handleDragEnd: (result: any) => void;
}

export const FileListSection = ({
  category,
  files,
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
  deleteMutation,
  handleDragEnd
}: FileListSectionProps) => {
  const categoryFiles = files.filter(f => f.category === category)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{category.charAt(0).toUpperCase() + category.slice(1)} Files</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`${category}-list`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {categoryFiles.map((file, index) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  index={index}
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
                  toggleActiveMutation={toggleActiveMutation}
                  deleteMutation={deleteMutation}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
