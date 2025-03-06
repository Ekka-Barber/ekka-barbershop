
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
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  console.warn('Service workers are not supported in this browser');
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
      console.error('Service Worker update failed:', error);
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
      await cache.addAll(resources);
      console.log('Resources prefetched successfully');
    } catch (error) {
      console.error('Failed to prefetch resources:', error);
    }
  }
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
      console.error('Failed to estimate storage:', error);
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
  if ('serviceWorker' in navigator && 'periodicSync' in (navigator as any).serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const periodicSync = (registration as any).periodicSync;
      
      if (periodicSync) {
        await periodicSync.register(tag, {
          minInterval,
        });
        return true;
      }
    } catch (error) {
      console.error('Periodic background sync failed:', error);
    }
  }
  
  return false;
};
