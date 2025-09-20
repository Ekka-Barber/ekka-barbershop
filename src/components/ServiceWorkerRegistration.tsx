
import React, { useEffect, useRef } from 'react';
import { registerServiceWorker } from "@/services/offlineSupport";

export const ServiceWorkerRegistration: React.FC = () => {
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Prevent double registration in React StrictMode
    if (hasRegistered.current) {
      return;
    }

    const registerSW = async () => {
      try {
        await registerServiceWorker();
        hasRegistered.current = true;
      } catch {
        // Service worker registration failed, but continue silently
      }
    };

    registerSW();
  }, []);

  return null;
};
