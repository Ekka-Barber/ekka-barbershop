import { lazy, Suspense } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ServicesTab } from './ServicesTab';

// Lazy-loaded components
const FileManagement = lazy(() => import('@/components/admin/FileManagement').then(mod => ({ default: mod.FileManagement })));
const QRCodeManager = lazy(() => import('@/components/admin/QRCodeManager'));
const PackageManagement = lazy(() => import('@/components/admin/package-management/PackageManagement').then(mod => ({ default: mod.PackageManagement })));
const UiElementsManager = lazy(() => import('@/components/admin/ui-elements/UiElementsManager').then(mod => ({ default: mod.UiElementsManager })));
const BranchesTab = lazy(() => import('@/components/admin/branch-management/BranchesTab').then(mod => ({ default: mod.BranchesTab })));

// Loading component for Suspense
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export const TabContent = () => {
  return (
    <>
      <TabsContent value="services" className="space-y-6">
        <ServicesTab />
      </TabsContent>

      <TabsContent value="packages" className="space-y-4">
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            <PackageManagement />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>


      <TabsContent value="branches" className="space-y-4">
        <h2 className="text-2xl font-bold">
          Branch Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            <BranchesTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="files" className="space-y-4">
        <h2 className="text-2xl font-bold">
          File Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            <FileManagement />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="qrcodes" className="space-y-4">
        <h2 className="text-2xl font-bold">
          QR Code Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            <QRCodeManager />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="ui-elements" className="space-y-4">
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            <UiElementsManager />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </>
  );
};
