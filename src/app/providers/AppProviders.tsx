import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

import { ServiceWorkerRegistration } from '@app/components/ServiceWorkerRegistration';

import { queryClient } from '@shared/lib/query-client';
import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import { OfflineNotification } from '@shared/ui/components/common/OfflineNotification';
import { Toaster } from '@shared/ui/components/toaster';
import { TooltipProvider } from '@shared/ui/components/tooltip';


import { LanguageProvider } from '@/contexts/LanguageContext';


export const AppProviders = ({ children }: PropsWithChildren) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          {children}
          <Toaster />
          <OfflineNotification />
          <ServiceWorkerRegistration />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
