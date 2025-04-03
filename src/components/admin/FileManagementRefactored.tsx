
import { useState } from 'react';
import { useFileManagement } from '@/hooks/useFileManagement';
import { useEndDateManager } from './file-management/useEndDateManager';
import { useDragAndDrop } from './file-management/useDragAndDrop';
import { FileUploadSection } from './file-management/FileUploadSection';
import { FileListSection } from './file-management/FileListSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileManagementHeader } from './file-management/components/FileManagementHeader';
import { FileManagementLoader } from './file-management/components/FileManagementLoader';
import { FileTabs } from './file-management/components/FileTabs';
import { FileManagementContent } from './file-management/components/FileManagementContent';

export const FileManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  
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
    filePreview,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: 'menu' | 'offers') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // For offers, we need branch information and optional end date/time
    if (category === 'offers') {
      // Find the selected branch details
      const selectedBranchDetails = branches?.find(branch => branch.id === selectedBranch);
      
      uploadMutation.mutate({ 
        file, 
        category,
        branchId: selectedBranch,
        branchName: selectedBranchDetails?.name,
        isAllBranches,
        endDate: selectedDate,
        endTime: selectedTime
      });
    } else {
      // For menu, don't include branch-related params or end date
      uploadMutation.mutate({
        file,
        category
      });
    }
  };

  const menuFiles = files?.filter(f => f.category === 'menu') || [];
  const offerFiles = files?.filter(f => f.category === 'offers') || [];
  const filteredFiles = activeTab === 'all' 
    ? files 
    : activeTab === 'menu' 
      ? menuFiles 
      : offerFiles;

  const fileCounts = {
    menu: menuFiles.length,
    offers: offerFiles.length,
    total: (files || []).length
  };
  
  // Handle tab change without scrolling to top
  const handleTabChange = (value: string) => {
    // Prevent default browser behavior
    window.history.pushState(null, '', window.location.href);
    setActiveTab(value);
  };

  if (isLoading) {
    return <FileManagementLoader />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <FileManagementHeader />
        </CardHeader>
        <CardContent>
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
            filePreview={filePreview}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <FileTabs 
          activeTab={activeTab} 
          handleTabChange={handleTabChange} 
          fileCounts={fileCounts} 
        />
        
        <FileManagementContent 
          activeTab={activeTab}
          filteredFiles={filteredFiles}
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
