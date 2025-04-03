
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { FileMetadata } from '@/types/file-management';
import { UseMutationResult } from '@tanstack/react-query';
import { FileListSection } from '../FileListSection';
import { FileToggleParams } from '@/hooks/file-management/types';

interface FileManagementContentProps {
  activeTab: string;
  filteredFiles: FileMetadata[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleEndDateUpdate: (fileId: string) => void;
  handleRemoveEndDate: (fileId: string) => void;
  toggleActiveMutation: UseMutationResult<any, unknown, FileToggleParams, unknown>;
  deleteMutation: UseMutationResult<any, unknown, FileMetadata, unknown>;
  handleDragEnd: (result: any) => void;
}

export const FileManagementContent = ({
  activeTab,
  filteredFiles,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleEndDateUpdate,
  handleRemoveEndDate,
  toggleActiveMutation,
  deleteMutation,
  handleDragEnd
}: FileManagementContentProps) => {
  return (
    <Tabs value={activeTab}>
      <TabsContent value="all" className="space-y-6 mt-0">
        <FileListSection
          category="menu"
          files={filteredFiles.filter(f => f.category === 'menu')}
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
          files={filteredFiles.filter(f => f.category === 'offers')}
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
      </TabsContent>
      
      <TabsContent value="menu" className="space-y-6 mt-0">
        <FileListSection
          category="menu"
          files={filteredFiles}
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
      </TabsContent>
      
      <TabsContent value="offers" className="space-y-6 mt-0">
        <FileListSection
          category="offers"
          files={filteredFiles}
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
      </TabsContent>
    </Tabs>
  );
};
