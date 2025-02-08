
// Cache name for offline support
const CACHE_NAME = 'ekka-v3';
const SW_VERSION = '1.0.1';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Enhanced logging function with timestamp
const log = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, data);
};

// Error logging function with stack trace
const logError = (message, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[ServiceWorker ${SW_VERSION}] ${timestamp} - ${message}`, error);
  if (error?.stack) {
    console.error(`Stack trace:`, error.stack);
  }
};

// Platform detection
const getPlatformInfo = () => {
  const ua = self.navigator?.userAgent.toLowerCase() || '';
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  return {
    isIOS,
    isAndroid,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'other',
    userAgent: ua
  };
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
  const platform = getPlatformInfo();
  log('Push received', { platform });
  
  try {
    const data = event.data.text();
    log('Raw push data:', data);
    
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
    
    log('User info:', { 
      language: userLang, 
      platform: platform.platform,
      isArabic
    });

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        messageId: notificationData.message_id,
        timestamp: Date.now(),
        platform: platform.platform
      },
      // Platform-specific vibration patterns
      vibrate: platform.isIOS ? [50, 50] : [100, 50, 100],
      // Force notification renotify on Android
      renotify: platform.isAndroid,
      tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
      // Platform specific options
      ...(platform.isIOS ? {
        silent: false, // Ensure sound on iOS
        sound: 'default'
      } : {}),
      ...(platform.isAndroid ? {
        // Android specific options
        importance: 'high',
        priority: 'high',
        timestamp: Date.now()
      } : {})
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
          deliveryStatus: 'delivered',
          platform: platform.platform,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!trackResponse.ok) {
        throw new Error(`Tracking failed with status: ${trackResponse.status}`);
      }
      
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
        log('Attempting to show notification', { 
          attempt: retryCount + 1, 
          platform: platform.platform 
        });

        await self.registration.showNotification(
          isArabic ? notificationData.title_ar : notificationData.title_en,
          baseOptions
        );
        
        log('Notification shown successfully', {
          messageId: notificationData.message_id,
          platform: platform.platform
        });
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

// Enhanced notification click handler with tracking and error handling
self.addEventListener('notificationclick', async (event) => {
  log('Notification clicked', { 
    tag: event.notification.tag,
    platform: getPlatformInfo().platform
  });
  
  event.notification.close();
  
  try {
    // Track the click event with platform info
    const trackResponse = await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        notification: event.notification.data,
        action: 'click',
        platform: getPlatformInfo().platform,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!trackResponse.ok) {
      throw new Error(`Tracking failed with status: ${trackResponse.status}`);
    }
    
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
            log('Focusing existing window', { url: client.url });
            return client.focus();
          }
        }
        // If no window exists, open new one
        if (clients.openWindow) {
          log('Opening new window', { url: event.notification.data.url });
          return clients.openWindow(event.notification.data.url);
        }
      })
      .catch(error => logError('Error handling notification click:', error))
  );
});

// Enhanced fetch event handler with proper caching and error handling
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
