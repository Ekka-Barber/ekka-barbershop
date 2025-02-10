
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { FileListItem } from "./FileListItem";

interface FileListSectionProps {
  category: string;
  files: any[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: any) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: any;
  deleteMutation: any;
  handleDragEnd: (result: any) => void;
}

export const FileListSection = ({
  category,
  files,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
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
      <DragDropContext onDragEnd={(result) => handleDragEnd(result)}>
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
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
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
