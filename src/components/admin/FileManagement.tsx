
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
    selectedStartDate,
    setSelectedStartDate,
    selectedStartTime,
    setSelectedStartTime,
    selectedEndDate,
    setSelectedEndDate,
    selectedEndTime,
    setSelectedEndTime,
    branches,
    files,
    isLoading,
    uploadMutation,
    toggleActiveMutation,
    deleteMutation,
    updateDatesMutation,
  } = useFileManagement();

  const { handleEndDateUpdate, handleRemoveEndDate } = useEndDateManager({
    selectedStartDate,
    selectedStartTime,
    selectedEndDate,
    selectedEndTime,
    updateDatesMutation
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
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedStartTime={selectedStartTime}
        setSelectedStartTime={setSelectedStartTime}
        selectedEndDate={selectedEndDate}
        setSelectedEndDate={setSelectedEndDate}
        selectedEndTime={selectedEndTime}
        setSelectedEndTime={setSelectedEndTime}
        handleFileUpload={handleFileUpload}
        uploading={uploading}
      />

      <div className="space-y-8">
        <FileListSection
          category="menu"
          files={files || []}
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
          handleDragEnd={handleDragEnd}
        />

        <FileListSection
          category="offers"
          files={files || []}
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
          handleDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};
