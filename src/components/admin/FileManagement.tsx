import { useFileManagement } from '@/hooks/useFileManagement';
import { useEndDateManager } from './file-management/useEndDateManager';
import { useDragAndDrop } from './file-management/useDragAndDrop';
import { FileUploadSection } from './file-management/FileUploadSection';
import { FileListSection } from './file-management/FileListSection';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

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
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>File Management</CardTitle>
            <CardDescription>
              Manage menu and offer files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>File Management</CardTitle>
          <CardDescription>
            Upload and manage menu and offer files
          </CardDescription>
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="relative" onClick={(e) => e.preventDefault()}>
                All Files
                <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {fileCounts.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="relative" onClick={(e) => e.preventDefault()}>
                Menu
                <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {fileCounts.menu}
                </span>
              </TabsTrigger>
              <TabsTrigger value="offers" className="relative" onClick={(e) => e.preventDefault()}>
                Offers
                <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {fileCounts.offers}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
          
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
      </div>
    </div>
  );
};
