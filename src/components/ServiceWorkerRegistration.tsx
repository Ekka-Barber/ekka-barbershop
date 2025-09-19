
import type React from 'react';
import { useEffect } from 'react';
import { registerServiceWorker } from "@/services/offlineSupport";
import { logger } from "@/utils/logger";

export const ServiceWorkerRegistration: React.FC = () => {
  useEffect(() => {
    const registerSW = async () => {
      try {
        await registerServiceWorker();
        logger.info("Service worker registered successfully");
      } catch (error) {
        logger.error("Failed to register service worker:", error);
      }
    };
    registerSW();
  }, []);

  return null;
};
