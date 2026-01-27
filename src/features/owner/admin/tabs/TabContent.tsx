import { Suspense } from 'react';

import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import { Separator } from '@shared/ui/components/separator';
import { TabsContent } from '@shared/ui/components/tabs';
import { lazyWithRetry } from '@shared/utils/lazyWithRetry';

// Lazy-loaded components for better bundle optimization
const FileManagement = lazyWithRetry(() => import('@features/owner/admin/FileManagement').then(mod => ({ default: mod.FileManagement })));
const QRCodeManager = lazyWithRetry(() => import('@features/owner/admin/QRCodeManager'));
const UiElementsManager = lazyWithRetry(() => import('@features/owner/admin/ui-elements/UiElementsManager'));

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


export const TabContent = () => {
  return (
    <>


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

    </>
  );
};
