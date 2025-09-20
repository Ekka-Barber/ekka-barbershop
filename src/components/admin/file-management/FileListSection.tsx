import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { FileListItem } from "./FileListItem";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FileMetadata } from "@/types/file-management";
import type { UseMutationResult } from "@tanstack/react-query";

interface FileListSectionProps {
  category: string;
  files: FileMetadata[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (file: FileMetadata) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<void, Error, { id: string; isActive: boolean }>;
  deleteMutation: UseMutationResult<void, Error, FileMetadata>;
  handleDragEnd: (result: DropResult) => void;
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
  const [isExpanded, setIsExpanded] = useState(true);
  
  const categoryFiles = files.filter(f => f.category === category)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
  const activeFiles = categoryFiles.filter(f => f.is_active);
  const inactiveFiles = categoryFiles.filter(f => !f.is_active);
  
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{categoryTitle}</h2>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {activeFiles.length} active
          </span>
          {inactiveFiles.length > 0 && (
            <span className="bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded-full text-xs font-medium">
              {inactiveFiles.length} inactive
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 bg-background border-t">
              <DragDropContext onDragEnd={(result) => handleDragEnd(result)}>
                <Droppable droppableId={`${category}-list`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {activeFiles.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Active {categoryTitle}</h3>
                          <div className="space-y-3">
                            {activeFiles.map((file, index) => (
                              <FileListItem
                                key={file.id}
                                file={file}
                                index={index}
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
                          </div>
                        </div>
                      )}
                      
                      {inactiveFiles.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <h3 className="text-sm font-medium text-muted-foreground">Inactive {categoryTitle}</h3>
                          <div className="space-y-3">
                            {inactiveFiles.map((file, index) => (
                              <FileListItem
                                key={file.id}
                                file={file}
                                index={activeFiles.length + index}
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
                          </div>
                        </div>
                      )}
                      
                      {categoryFiles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No {categoryTitle.toLowerCase()} have been uploaded yet</p>
                          <p className="text-sm mt-1">Upload {category} files using the form above</p>
                        </div>
                      )}
                      
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
