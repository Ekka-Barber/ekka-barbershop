
import React, { useEffect, useRef } from 'react';
import { registerServiceWorker } from "@/services/offlineSupport";
import { logger } from "@/utils/logger";

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
        logger.info("Service worker registered successfully");
        hasRegistered.current = true;
      } catch (error) {
        logger.error("Failed to register service worker:", error);
      }
    };

    registerSW();
  }, []);

  return null;
};
