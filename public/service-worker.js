
// Cache name for offline support
const CACHE_NAME = 'ekka-v1';
const SW_VERSION = '1.0.0';
const RATE_LIMIT_PER_DAY = 50; // Maximum notifications per day per subscription

// Enhanced logging function
const log = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, data);
};

// Error logging function
const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, error);
};

// Install event - Cache basic files
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

// Activate event - Clean up old caches
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
      })
    ])
  );
});

// Queue for storing failed notification attempts
let notificationQueue = [];

// Push event - Handle incoming notifications
self.addEventListener('push', async (event) => {
  log('Push received');
  
  try {
    const data = event.data.text();
    log('Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
    } catch (error) {
      logError('Invalid notification data format:', error);
      throw new Error('Invalid notification data');
    }

    // Check rate limit before proceeding
    const rateLimitCheck = await fetch('/api/check-rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: self.registration.pushManager.getSubscription().endpoint
      })
    });

    if (!rateLimitCheck.ok) {
      logError('Rate limit exceeded');
      return;
    }

    // Get device info
    const deviceInfo = {
      os: self.navigator?.platform || 'unknown',
      browser: self.navigator?.userAgent || 'unknown',
      version: SW_VERSION
    };

    const options = {
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
    };

    // If offline, queue the notification
    if (!navigator.onLine) {
      notificationQueue.push({ title: notificationData.title, options });
      return;
    }

    event.waitUntil(
      (async () => {
        try {
          await self.registration.showNotification(notificationData.title, options);
          log('Notification shown successfully');
          
          // Track successful delivery with enhanced data
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
          logError('Error showing notification:', error);
          notificationQueue.push({ title: notificationData.title, options });
          
          // Track failure
          await fetch('/api/track-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'failed',
              messageId: notificationData.message_id,
              error: {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
              },
              deviceInfo,
              platform: getPlatformType()
            })
          });
          
          throw error;
        }
      })()
    );
  } catch (error) {
    logError('Error handling push event:', error);
    throw error;
  }
});

// Process queued notifications when coming back online
self.addEventListener('online', () => {
  log('Connection restored, processing queued notifications');
  
  while (notificationQueue.length > 0) {
    const { title, options } = notificationQueue.shift();
    self.registration.showNotification(title, options)
      .catch(error => logError('Error showing queued notification:', error));
  }
});

// Enhanced notification click event with tracking
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

// Fetch event - Basic offline support
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
