
import { useEffect } from 'react';
import { registerServiceWorker } from "@/services/offlineSupport";
import { logger } from "@/utils/logger";

export const ServiceWorkerRegistration = () => {
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
