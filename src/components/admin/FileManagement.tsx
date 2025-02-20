
import { useFileManagement } from '@/hooks/useFileManagement';
import { useEndDateManager } from './file-management/useEndDateManager';
import { useDragAndDrop } from './file-management/useDragAndDrop';
import { FileUploadSection } from './file-management/FileUploadSection';
import { FileListSection } from './file-management/FileListSection';

export const FileManagement = () => {
  const {
    uploading,
    selectedBranch,
    setSelectedBranch,
    isAllBranches,
    setIsAllBranches,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    branches,
    files,
    isLoading,
    uploadMutation,
    toggleActiveMutation,
    deleteMutation,
    updateEndDateMutation,
  } = useFileManagement();

  const { handleEndDateUpdate, handleRemoveEndDate } = useEndDateManager({
    selectedDate,
    selectedTime,
    updateEndDateMutation
  });

  const { handleDragEnd } = useDragAndDrop(files || []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, category });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <FileUploadSection
        branches={branches || []}
        isAllBranches={isAllBranches}
        setIsAllBranches={setIsAllBranches}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        handleFileUpload={handleFileUpload}
        uploading={uploading}
      />

      <div className="space-y-8">
        <FileListSection
          category="menu"
          files={files || []}
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
          files={files || []}
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
      </div>
    </div>
  );
};
