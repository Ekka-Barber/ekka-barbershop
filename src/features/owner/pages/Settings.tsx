import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { useTabNavigation } from '@shared/hooks/useTabNavigation';
import { Card } from '@shared/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/components/tabs';

import { BranchManagement, SponsorManagement } from '@/features/owner/settings/components';
import { EmployeeManagement } from '@/features/owner/settings/components/EmployeeManagement';

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-6 sm:p-8 h-24 sm:h-32">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
      <span className="text-xs sm:text-sm text-muted-foreground">
        Loading...
      </span>
    </div>
  </div>
);

const Settings = () => {
  // Use URL-persisted tab navigation
  const { currentTab, setActiveTab } = useTabNavigation({
    defaultTab: 'branches',
  });

  return (
    <div className="page-stack">
      <h1 className="section-title">Settings</h1>

      <Card className="overflow-hidden">
        <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="tabs-underline-list px-2 sm:px-3 md:px-4">
            <TabsTrigger
              value="branches"
              className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
            >
              Studio Network
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
            >
              Staff Authority
            </TabsTrigger>
            <TabsTrigger
              value="sponsors"
              className="tabs-underline-trigger text-xs sm:text-sm md:text-base min-w-max flex-shrink-0"
            >
              Partner Hub
            </TabsTrigger>
          </TabsList>

          <div className="p-3 sm:p-4 md:p-6">
            <Suspense fallback={<LoadingFallback />}>
              <TabsContent value="branches" className="mt-0 space-y-4">
                <BranchManagement />
              </TabsContent>

              <TabsContent value="employees" className="mt-0 space-y-4">
                <EmployeeManagement />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-0 space-y-4">
                <SponsorManagement />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
