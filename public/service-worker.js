
// Cache name for offline support
const CACHE_NAME = 'ekka-v3';
const SW_VERSION = '1.0.0';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Enhanced logging function
const log = (message, data = {}) => {
  console.log(`[ServiceWorker ${SW_VERSION}] ${message}`, data);
};

// Error logging function
const logError = (message, error) => {
  console.error(`[ServiceWorker ${SW_VERSION}] ${message}`, error);
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  log('Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        log('Caching app shell');
        return cache.addAll(filesToCache);
      })
      .catch(error => logError('Cache installation failed:', error))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating service worker');
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              log('Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Immediately claim any new clients
      self.clients.claim().then(() => {
        log('Clients claimed');
      })
    ])
  );
});

// Enhanced push event with better error handling and logging
self.addEventListener('push', async (event) => {
  log('Push received');
  
  try {
    const data = event.data.text();
    log('Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
      log('Parsed notification data:', notificationData);
    } catch (parseError) {
      logError('Error parsing notification data:', parseError);
      throw new Error('Invalid notification data format');
    }

    // Get browser language and platform info
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');
    const isIOS = /iphone|ipad|ipod/.test(self.navigator.userAgent.toLowerCase());
    
    log('User info:', { language: userLang, platform: isIOS ? 'iOS' : 'Other' });

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        messageId: notificationData.message_id,
        timestamp: Date.now()
      },
      vibrate: isIOS ? [50, 50] : [100, 50, 100],
      renotify: true,
      tag: `ekka-notification-${notificationData.message_id || Date.now()}`
    };

    // Track notification received event
    try {
      const trackResponse = await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'received',
          notification: notificationData,
          deliveryStatus: 'delivered'
        })
      });
      
      const trackResult = await trackResponse.json();
      log('Tracked notification received:', trackResult);
    } catch (trackError) {
      logError('Error tracking notification:', trackError);
    }

    // Show the notification with retry mechanism
    const maxRetries = 3;
    let retryCount = 0;
    
    const showNotification = async () => {
      try {
        await self.registration.showNotification(
          isArabic ? notificationData.title_ar : notificationData.title_en,
          baseOptions
        );
        log('Notification shown successfully');
      } catch (error) {
        logError('Error showing notification:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          log(`Retrying notification display (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return showNotification();
        }
        throw error;
      }
    };

    event.waitUntil(showNotification());
  } catch (error) {
    logError('Error processing push notification:', error);
    throw error;
  }
});

// Enhanced notification click handler with tracking
self.addEventListener('notificationclick', async (event) => {
  log('Notification click received');
  
  event.notification.close();
  
  try {
    // Track the click event
    const trackResponse = await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        notification: event.notification.data,
        action: 'click',
        timestamp: Date.now()
      })
    });
    
    const trackResult = await trackResponse.json();
    log('Tracked notification click:', trackResult);
  } catch (error) {
    logError('Error tracking notification click:', error);
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Try to focus existing window
        for (let client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window exists, open new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
      .catch(error => logError('Error handling notification click:', error))
  );
});

// Enhanced fetch event handler with proper caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            if (response) {
              log('Serving from cache:', event.request.url);
              return response;
            }
            log('Resource not in cache:', event.request.url);
            return caches.match('/');
          });
      })
  );
});
