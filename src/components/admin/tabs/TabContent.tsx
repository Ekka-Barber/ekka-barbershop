import { lazy, Suspense } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ServicesTab } from './ServicesTab';

// Lazy-loaded components for better bundle optimization
const FileManagement = lazy(() => import('@/components/admin/FileManagement').then(mod => ({ default: mod.FileManagement })));
const QRCodeManager = lazy(() => import('@/components/admin/QRCodeManager'));
const UiElementsManager = lazy(() => import('@/components/admin/ui-elements/UiElementsManager').then(mod => ({ default: mod.UiElementsManager })));
const BranchesTab = lazy(() => import('@/components/admin/branch-management/BranchesTab').then(mod => ({ default: mod.BranchesTab })));
const GoogleAdsTab = lazy(() => import('@/components/admin/GoogleAdsTab').then(mod => ({ default: mod.GoogleAdsTab })));

// Preload critical components
const preloadBranches = () => import('@/components/admin/branch-management/BranchesTab');

// Enhanced loading component for heavy features
const TabLoader = ({ feature }: { feature?: string }) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {feature && <p className="text-sm text-muted-foreground animate-pulse">Loading {feature}...</p>}
    </div>
  </div>
);

// Preload critical components on mount
if (typeof window !== 'undefined') {
  setTimeout(() => {
    preloadBranches();
  }, 100);
}

export const TabContent = () => {
  return (
    <>
      <TabsContent value="services" className="space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <ServicesTab />
      </TabsContent>

      <TabsContent value="branches" className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <h2 className="text-2xl font-bold">
          Branch Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader feature="Branch Management" />}>
            <BranchesTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="files" className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <h2 className="text-2xl font-bold">
          File Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader feature="File Management" />}>
            <FileManagement />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="qrcodes" className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <h2 className="text-2xl font-bold">
          QR Code Management
        </h2>
        <Separator />
        <ErrorBoundary>
          <Suspense fallback={<TabLoader feature="QR Code Management" />}>
            <QRCodeManager />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="ui-elements" className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <ErrorBoundary>
          <Suspense fallback={<TabLoader feature="UI Elements Management" />}>
            <UiElementsManager />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="google-ads" className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <ErrorBoundary>
          <Suspense fallback={<TabLoader feature="Google Ads Management" />}>
            <GoogleAdsTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </>
  );
};
