
import { logger } from '@shared/utils/logger';

/**
 * Functions for managing offline capabilities and service worker registration
 */

/**
 * Registers the service worker for offline support
 * @returns A promise that resolves when registration is complete
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers first to ensure clean installation
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of existingRegistrations) {
        await registration.unregister();
      }
      
      // Use the updated registration method with more options
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none', // Ensure fresh service worker checks
        type: 'classic'
      });
      
      // Log successful registration
      logger.info('Service Worker registered with scope:', registration.scope);
      
      // Event handler for when a new service worker is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('New Service Worker installed and waiting to activate');
              // Could show UI to prompt user to refresh
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      logger.error('Service Worker registration failed:', error);
      
      // Try to unregister any problematic service workers
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          await existingRegistration.unregister();
          logger.warn('Unregistered problematic service worker, please reload the page');
        }
      } catch (unregError) {
        logger.error('Failed to unregister service worker:', unregError);
      }
      
      return null;
    }
  }
  
  logger.warn('Service workers are not supported in this browser');
  return null;
};

/**
 * Updates the service worker
 * @returns A promise that resolves when update is complete
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      logger.error('Service Worker update failed:', error);
    }
  }
  
  return false;
};

/**
 * Checks if the app is currently online
 * @returns True if the app is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Listens for changes in online status
 * @param callback Function to call when online status changes
 * @returns Cleanup function
 */
export const listenForOnlineStatusChanges = (
  callback: (isOnline: boolean) => void
): () => void => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Prefetches critical resources for offline use
 * @param resources Array of URLs to prefetch
 */
export const prefetchResources = async (resources: string[]): Promise<void> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('ekka-prefetch');
      
      // Use individual add operations with error handling
      const addPromises = resources.map(async (resource) => {
        try {
          await cache.add(resource);
          logger.debug(`Resource prefetched: ${resource}`);
        } catch (error) {
          logger.warn(`Failed to prefetch resource: ${resource}`, error);
        }
      });
      
      await Promise.allSettled(addPromises);
      logger.info('Resources prefetched successfully');
    } catch (error) {
      logger.error('Failed to prefetch resources:', error);
    }
  }
};

/**
 * Sends a message to the service worker
 * @param message The message to send
 * @returns A promise that resolves when the message is sent
 */
export const sendMessageToServiceWorker = async (message: unknown): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      await navigator.serviceWorker.ready;
      navigator.serviceWorker.controller.postMessage(message);
    } catch (error) {
      logger.error('Failed to send message to service worker:', error);
    }
  }
};

/**
 * Prefetches common resources for better offline performance
 * @returns A promise that resolves when prefetching is complete
 */
export const prefetchCommonResources = async (): Promise<void> => {
  await sendMessageToServiceWorker({ type: 'PREFETCH_COMMON' });
  logger.info('Triggered prefetching of common resources');
};

/**
 * Forces an update of the service worker
 * @returns A promise that resolves when the update is complete
 */
export const forceServiceWorkerUpdate = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Reload the page to get the new service worker
      window.location.reload();
      return true;
    } catch (error) {
      logger.error('Failed to update service worker:', error);
    }
  }
  return false;
};

/**
 * Gets the storage estimation for the app
 * @returns Storage usage information
 */
export const getStorageEstimation = async (): Promise<{
  quota: number;
  usage: number;
  usagePercentage: number;
} | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      if (typeof quota === 'number' && typeof usage === 'number') {
        return {
          quota,
          usage,
          usagePercentage: (usage / quota) * 100
        };
      }
    } catch (error) {
      logger.error('Failed to estimate storage:', error);
    }
  }
  
  return null;
};

/**
 * Checks if the app should display offline content
 * @returns True if offline content should be displayed
 */
export const shouldShowOfflineContent = (): boolean => {
  return !navigator.onLine;
};

/**
 * Registers for periodic background sync (if supported)
 * @param tag The sync tag
 * @param minInterval Minimum interval in milliseconds
 */
export const registerPeriodicSync = async (
  tag: string,
  minInterval: number
): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'periodicSync' in (navigator as unknown as { serviceWorker: { periodicSync: unknown } }).serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const periodicSync = (registration as unknown as { periodicSync: { register: (tag: string, options: { minInterval: number }) => Promise<void> } }).periodicSync;
      
      if (periodicSync) {
        await periodicSync.register(tag, {
          minInterval,
        });
        return true;
      }
    } catch (error) {
      logger.error('Periodic background sync failed:', error);
    }
  }
  
  return false;
};
