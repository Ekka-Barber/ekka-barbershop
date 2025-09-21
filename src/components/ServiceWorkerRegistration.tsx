
import React, { useEffect, useRef } from 'react';
import { registerServiceWorker, prefetchCommonResources } from "@/services/offlineSupport";

export const ServiceWorkerRegistration: React.FC = () => {
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Prevent double registration in React StrictMode
    if (hasRegistered.current) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await registerServiceWorker();
        hasRegistered.current = true;

        // Prefetch common resources after successful registration
        if (registration) {
          // Delay prefetching to not impact initial load
          setTimeout(() => {
            prefetchCommonResources().catch(() => {
              // Prefetching failed, but continue silently
            });
          }, 3000);
        }
      } catch {
        // Service worker registration failed, but continue silently
      }
    };

    registerSW();
  }, []);

  return null;
};
