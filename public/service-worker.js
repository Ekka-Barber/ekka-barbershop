
// Cache name for offline support
const CACHE_NAME = 'ekka-v3';
const SW_VERSION = '1.0.2';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Enhanced logging function with timestamp and service worker version
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

// Platform detection with detailed checks
const getPlatformInfo = () => {
  const ua = self.navigator?.userAgent.toLowerCase() || '';
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
  const isChrome = /chrome/.test(ua);
  
  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'other',
    browser: isSafari ? 'safari' : isChrome ? 'chrome' : 'other',
    userAgent: ua
  };
};

// Enhanced install event with retry logic
self.addEventListener('install', (event) => {
  log('Installing service worker');
  
  const installWithRetry = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const cache = await caches.open(CACHE_NAME);
        log('Caching app shell');
        await cache.addAll(filesToCache);
        log('Cache installation successful');
        return;
      } catch (error) {
        retryCount++;
        logError(`Cache installation attempt ${retryCount} failed:`, error);
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  };

  event.waitUntil(
    installWithRetry()
      .catch(error => logError('Cache installation failed after retries:', error))
  );
  
  self.skipWaiting();
});

// Enhanced activate event
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
    ]).catch(error => logError('Activation error:', error))
  );
});

// Enhanced push event with better error handling and platform-specific behavior
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
      vibrate: platform.isIOS ? [50, 50] : [100, 50, 100],
      renotify: platform.isAndroid,
      tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
      ...(platform.isIOS ? {
        silent: false,
        sound: 'default'
      } : {}),
      ...(platform.isAndroid ? {
        importance: 'high',
        priority: 'high',
        timestamp: Date.now()
      } : {})
    };

    // Track notification received event with retry logic
    const trackNotification = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
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
          return;
        } catch (error) {
          retryCount++;
          logError(`Tracking attempt ${retryCount} failed:`, error);
          if (retryCount === maxRetries) {
            console.error('Failed to track notification after retries');
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    };

    // Show the notification with retry mechanism
    const showNotification = async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
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
          return;
        } catch (error) {
          retryCount++;
          logError(`Show notification attempt ${retryCount} failed:`, error);
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    };

    // Execute both operations
    event.waitUntil(
      Promise.all([
        trackNotification().catch(error => logError('Final tracking error:', error)),
        showNotification().catch(error => logError('Final show notification error:', error))
      ])
    );
  } catch (error) {
    logError('Critical error in push notification handling:', error);
    throw error;
  }
});

// Enhanced notification click handler
self.addEventListener('notificationclick', async (event) => {
  log('Notification clicked', { 
    tag: event.notification.tag,
    platform: getPlatformInfo().platform
  });
  
  event.notification.close();
  
  try {
    // Track the click event with retry logic
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
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
        break;
      } catch (error) {
        retryCount++;
        logError(`Click tracking attempt ${retryCount} failed:`, error);
        if (retryCount === maxRetries) {
          console.error('Failed to track notification click after retries');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Handle the click action
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
  } catch (error) {
    logError('Critical error in notification click handling:', error);
  }
});

// Enhanced fetch event handler with better caching strategy
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
