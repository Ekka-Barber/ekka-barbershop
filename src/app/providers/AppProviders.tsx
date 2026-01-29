import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';

import { ServiceWorkerRegistration } from '@app/components/ServiceWorkerRegistration';

import { queryClient } from '@shared/lib/query-client';
import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import { OfflineNotification } from '@shared/ui/components/common/OfflineNotification';
import { Toaster } from '@shared/ui/components/toaster';
import { TooltipProvider } from '@shared/ui/components/tooltip';


import { LanguageProvider } from '@/contexts/LanguageContext';


export const AppProviders = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userAgent = navigator.userAgent || '';
    if (!/Android/i.test(userAgent)) return;

    const root = document.documentElement;
    const body = document.body;

    const hasOpenOverlay = () => Boolean(
      document.querySelector(
        '[data-radix-portal] [data-state="open"][role="dialog"],' +
        '[data-radix-portal] [data-state="open"][role="alertdialog"],' +
        '[data-state="open"][role="dialog"],' +
        '[data-state="open"][role="alertdialog"]'
      )
    );

    const unlockScroll = () => {
      root.style.removeProperty('overflow');
      root.style.removeProperty('position');
      root.style.removeProperty('top');
      root.style.removeProperty('left');
      root.style.removeProperty('right');
      root.style.removeProperty('width');
      root.style.removeProperty('padding-right');
      root.style.removeProperty('touch-action');
      root.removeAttribute('data-scroll-locked');

      body.style.removeProperty('overflow');
      body.style.removeProperty('overflow-x');
      body.style.removeProperty('overflow-y');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('left');
      body.style.removeProperty('right');
      body.style.removeProperty('width');
      body.style.removeProperty('padding-right');
      body.style.removeProperty('touch-action');
      body.removeAttribute('data-scroll-locked');

      body.style.overflowY = 'auto';
      body.style.touchAction = 'pan-y';
      root.style.touchAction = 'pan-y';
    };

    const maybeUnlock = () => {
      const locked = body.hasAttribute('data-scroll-locked')
        || root.hasAttribute('data-scroll-locked')
        || body.style.overflow === 'hidden'
        || root.style.overflow === 'hidden'
        || body.style.position === 'fixed'
        || root.style.position === 'fixed';

      if (locked && !hasOpenOverlay()) {
        unlockScroll();
      }
    };

    const observer = new MutationObserver(() => {
      maybeUnlock();
    });

    observer.observe(body, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-scroll-locked'],
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-scroll-locked'],
    });

    const handleVisibility = () => {
      if (!document.hidden) {
        maybeUnlock();
      }
    };

    const handleTouch = () => {
      maybeUnlock();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('wheel', handleTouch, { passive: true });

    maybeUnlock();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('wheel', handleTouch);
    };
  }, []);

  return (
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
};
