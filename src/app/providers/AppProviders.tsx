import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useRef } from 'react';

import { ServiceWorkerRegistration } from '@app/components/ServiceWorkerRegistration';

import { useVisibilityChange } from '@shared/hooks/useVisibilityChange';
import { queryClient } from '@shared/lib/query-client';
import { ErrorBoundary } from '@shared/ui/components/common/ErrorBoundary';
import { OfflineNotification } from '@shared/ui/components/common/OfflineNotification';
import { Toaster } from '@shared/ui/components/toaster';
import { TooltipProvider } from '@shared/ui/components/tooltip';


import { LanguageProvider } from '@/contexts/LanguageContext';


export const AppProviders = ({ children }: PropsWithChildren) => {
  const maybeUnlockRef = useRef<(() => void) | null>(null);
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent || '');

  useEffect(() => {
    if (typeof window === 'undefined' || !isAndroid) return;

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

    maybeUnlockRef.current = maybeUnlock;

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

    const handleTouch = () => {
      maybeUnlock();
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('wheel', handleTouch, { passive: true });

    maybeUnlock();

    return () => {
      maybeUnlockRef.current = null;
      observer.disconnect();
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('wheel', handleTouch);
    };
  }, [isAndroid]);

  useVisibilityChange(() => {
    maybeUnlockRef.current?.();
  }, isAndroid);

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
