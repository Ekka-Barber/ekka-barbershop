
// Cache name for offline support
const CACHE_NAME = 'ekka-v1';
const SW_VERSION = '1.0.0';
const RATE_LIMIT_PER_DAY = 50;

// Enhanced logging with timestamp
const log = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, data);
};

const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, error);
};

// Offline queue implementation with persistence
const QUEUE_NAME = 'notification-queue';
let notificationQueue = [];

// Load queue from IndexedDB
const initializeQueue = async () => {
  try {
    const db = await openDB('sw-store', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(QUEUE_NAME)) {
          db.createObjectStore(QUEUE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
    
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    notificationQueue = await store.getAll();
    log('Notification queue initialized', { queueSize: notificationQueue.length });
  } catch (error) {
    logError('Failed to initialize queue', error);
  }
};

// Save notification to queue
const addToQueue = async (notification) => {
  try {
    const db = await openDB('sw-store', 1);
    const tx = db.transaction(QUEUE_NAME, 'readwrite');
    const store = tx.objectStore(QUEUE_NAME);
    await store.add({
      ...notification,
      timestamp: Date.now(),
      retryCount: 0
    });
    await tx.complete;
    log('Added notification to queue', notification);
  } catch (error) {
    logError('Failed to add notification to queue', error);
  }
};

// Remove notification from queue
const removeFromQueue = async (id) => {
  try {
    const db = await openDB('sw-store', 1);
    const tx = db.transaction(QUEUE_NAME, 'readwrite');
    const store = tx.objectStore(QUEUE_NAME);
    await store.delete(id);
    await tx.complete;
    log('Removed notification from queue', { id });
  } catch (error) {
    logError('Failed to remove notification from queue', error);
  }
};

// Install event
self.addEventListener('install', (event) => {
  log('Installing service worker');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  log('Activating service worker');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      initializeQueue() // Initialize queue on activation
    ])
  );
});

// Enhanced push event handler with error classification and retry logic
self.addEventListener('push', async (event) => {
  log('Push received');
  
  try {
    const data = event.data.text();
    log('Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
    } catch (error) {
      throw new Error('INVALID_PAYLOAD');
    }

    // Validate required fields
    if (!notificationData.title || !notificationData.body) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const deviceInfo = {
      os: self.navigator?.platform || 'unknown',
      browser: self.navigator?.userAgent || 'unknown',
      version: SW_VERSION,
      online: navigator.onLine
    };

    // If offline, queue the notification
    if (!navigator.onLine) {
      log('Device offline, queueing notification');
      await addToQueue({
        title: notificationData.title,
        options: {
          body: notificationData.body,
          icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
          badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
          data: {
            url: notificationData.url || 'https://ekka.lovableproject.com/offers',
            messageId: notificationData.message_id,
            timestamp: Date.now()
          },
          requireInteraction: true,
          tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
          ...(notificationData.platform_data || {})
        },
        deviceInfo
      });
      return;
    }

    event.waitUntil(
      (async () => {
        try {
          // Check rate limit
          const rateLimitCheck = await fetch('/api/check-rate-limit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: self.registration.pushManager.getSubscription().endpoint
            })
          });

          if (!rateLimitCheck.ok) {
            throw new Error('RATE_LIMIT_EXCEEDED');
          }

          // Show notification
          await self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
            badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
            data: {
              url: notificationData.url || 'https://ekka.lovableproject.com/offers',
              messageId: notificationData.message_id,
              timestamp: Date.now()
            },
            requireInteraction: true,
            tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
            ...(notificationData.platform_data || {})
          });

          // Track successful delivery
          await fetch('/api/track-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'delivered',
              messageId: notificationData.message_id,
              timestamp: new Date().toISOString(),
              deviceInfo,
              platform: getPlatformType()
            })
          });
        } catch (error) {
          // Classify and handle different types of errors
          const errorType = error.message || 'UNKNOWN_ERROR';
          const retryable = !['RATE_LIMIT_EXCEEDED', 'INVALID_PAYLOAD', 'MISSING_REQUIRED_FIELDS'].includes(errorType);

          logError('Error showing notification:', {
            error,
            type: errorType,
            retryable
          });

          // Add to queue if error is retryable
          if (retryable) {
            await addToQueue({
              title: notificationData.title,
              options: {
                body: notificationData.body,
                icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
                badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
                data: {
                  url: notificationData.url || 'https://ekka.lovableproject.com/offers',
                  messageId: notificationData.message_id,
                  timestamp: Date.now()
                },
                requireInteraction: true,
                tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
                ...(notificationData.platform_data || {})
              },
              deviceInfo
            });
          }

          // Track failure
          await fetch('/api/track-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'failed',
              messageId: notificationData.message_id,
              error: {
                type: errorType,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                retryable
              },
              deviceInfo,
              platform: getPlatformType()
            })
          });
        }
      })()
    );
  } catch (error) {
    logError('Critical error in push event:', error);
    throw error;
  }
});

// Process queued notifications when coming back online
self.addEventListener('online', () => {
  log('Connection restored, processing queued notifications');
  
  (async () => {
    const db = await openDB('sw-store', 1);
    const tx = db.transaction(QUEUE_NAME, 'readonly');
    const store = tx.objectStore(QUEUE_NAME);
    const queue = await store.getAll();
    
    for (const notification of queue) {
      try {
        await self.registration.showNotification(notification.title, notification.options);
        await removeFromQueue(notification.id);
        
        // Track successful delivery from queue
        await fetch('/api/track-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'delivered_from_queue',
            messageId: notification.options.data.messageId,
            timestamp: new Date().toISOString(),
            deviceInfo: notification.deviceInfo,
            queuedAt: new Date(notification.timestamp).toISOString()
          })
        });
      } catch (error) {
        logError('Error processing queued notification:', error);
        
        // Increment retry count and update queue if under max retries
        if ((notification.retryCount || 0) < 3) {
          const updatedNotification = {
            ...notification,
            retryCount: (notification.retryCount || 0) + 1
          };
          await removeFromQueue(notification.id);
          await addToQueue(updatedNotification);
        } else {
          // Remove from queue if max retries exceeded
          await removeFromQueue(notification.id);
        }
      }
    }
  })();
});

// Enhanced notification click event handler
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked', {
    tag: event.notification.tag,
    data: event.notification.data
  });
  
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      try {
        // Track the click with enhanced data
        await fetch('/api/track-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'clicked',
            messageId: event.notification.data.messageId,
            timestamp: new Date().toISOString(),
            deviceInfo: {
              os: self.navigator?.platform || 'unknown',
              browser: self.navigator?.userAgent || 'unknown',
              version: SW_VERSION
            },
            platform: getPlatformType(),
            action: event.action || 'default'
          })
        });

        // Try to focus existing window
        const windowClients = await clients.matchAll({ 
          type: 'window', 
          includeUncontrolled: true 
        });
        
        for (let client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window exists, open new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      } catch (error) {
        logError('Error handling notification click:', error);
      }
    })()
  );
});

// Helper function to determine platform type
const getPlatformType = () => {
  const userAgent = self.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'web';
};

// Basic offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Error handling
self.addEventListener('error', (event) => {
  logError('Service worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
  logError('Unhandled promise rejection:', event.reason);
});

