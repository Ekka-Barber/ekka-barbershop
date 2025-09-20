import { useFileManagement } from '@/hooks/useFileManagement';
import { useEndDateManager } from './file-management/useEndDateManager';
import { useDragAndDrop } from './file-management/useDragAndDrop';
import { FileUploadSection } from './file-management/FileUploadSection';
import { FileListSection } from './file-management/FileListSection';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import React from 'react';

// Temporary debug function - call testSupabaseInsert() in browser console
const testSupabaseInsert = async () => {
  console.log('=== TESTING SUPABASE INSERT ===');

  try {
    const { supabase } = await import("@/integrations/supabase/client");

    // Test authentication
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', { user: user?.user?.id, error: authError });

    // Test session
    const { data: session } = await supabase.auth.getSession();
    console.log('Session:', { hasSession: !!session?.session });

    // Test simple select
    const { data: selectData, error: selectError } = await supabase
      .from('marketing_files')
      .select('id')
      .limit(1);
    console.log('Select test:', { data: selectData, error: selectError });

    if (selectError) {
      console.error('❌ Select failed:', selectError);
      return;
    }

    // Test insert
    const testRecord = {
      file_name: 'test.jpg',
      file_path: 'test-path.jpg',
      file_type: 'image/jpeg',
      category: 'menu',
      is_active: true
    };

    console.log('Attempting insert with:', testRecord);

    const { data: insertData, error: insertError } = await supabase
      .from('marketing_files')
      .insert(testRecord)
      .select();

    console.log('Insert result:', { data: insertData, error: insertError });

    if (insertError) {
      console.error('❌ Insert failed with details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Insert succeeded!');
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }

  console.log('=== END TEST ===');
};

// Debug function to test PDF URL accessibility
const testPDFUrls = async () => {
  console.log('=== TESTING PDF URL ACCESSIBILITY ===');

  const pdfUrls = [
    'https://jfnjvphxhzxojxgptmtu.supabase.co/storage/v1/object/public/marketing_files/d0fa92ba-6e25-4fe6-ad2b-d3d53b5bc6c0.pdf',
    'https://jfnjvphxhzxojxgptmtu.supabase.co/storage/v1/object/public/marketing_files/c2528c5b-8ba5-4ef5-8208-3fcd05157f3a.pdf',
    'https://jfnjvphxhzxojxgptmtu.supabase.co/storage/v1/object/public/marketing_files/9f533fd8-56ad-44d4-8797-0428f1e4092c.pdf'
  ];

  for (const url of pdfUrls) {
    try {
      console.log(`Testing URL: ${url}`);
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log(`✅ ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        cacheControl: response.headers.get('cache-control')
      });
    } catch (error) {
      console.error(`❌ ${url}:`, error);
    }
  }

  console.log('=== END PDF URL TEST ===');
};

// Make it globally available
if (typeof window !== 'undefined') {
  (window as Window & { testSupabaseInsert?: typeof testSupabaseInsert; testPDFUrls?: typeof testPDFUrls }).testSupabaseInsert = testSupabaseInsert;
  (window as Window & { testSupabaseInsert?: typeof testSupabaseInsert; testPDFUrls?: typeof testPDFUrls }).testPDFUrls = testPDFUrls;
}

export const FileManagement = React.memo(() => {
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

    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('File:', { name: file.name, type: file.type, size: file.size });
    console.log('Category:', category);
    console.log('isAllBranches:', isAllBranches);
    console.log('selectedBranch:', selectedBranch);
    console.log('selectedDate:', selectedDate);
    console.log('selectedTime:', selectedTime);

    // For offers, we need branch information and optional end date/time
    if (category === 'offers') {
      // Find the selected branch details
      const selectedBranchDetails = branches?.find(branch => branch.id === selectedBranch);
      console.log('Selected branch details:', selectedBranchDetails);
      console.log('Available branches:', branches?.map(b => ({ id: b.id, name: b.name })));

      if (!isAllBranches && !selectedBranch) {
        console.error('❌ Branch validation failed: No branch selected for offers');
        return;
      }

      const uploadParams = {
        file,
        category,
        branchId: selectedBranch,
        branchName: selectedBranchDetails?.name,
        isAllBranches,
        endDate: selectedDate,
        endTime: selectedTime
      };

      console.log('Upload params for offers:', uploadParams);

      uploadMutation.mutate(uploadParams);
    } else {
      // For menu, don't include branch-related params or end date
      const uploadParams = { file, category };
      console.log('Upload params for menu:', uploadParams);

      uploadMutation.mutate(uploadParams);
    }
    console.log('=== END FILE UPLOAD DEBUG ===');
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
});

FileManagement.displayName = 'FileManagement';
