
// Cache name for offline support
const CACHE_NAME = 'ekka-v2';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
      })
      .catch(error => console.error('[ServiceWorker] Cache installation failed:', error))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Immediately claim any new clients
      self.clients.claim().then(() => {
        console.log('[ServiceWorker] Clients claimed');
      })
    ])
  );
});

// Enhanced push event with better error handling and logging
self.addEventListener('push', async (event) => {
  console.log('[ServiceWorker] Push received');
  
  try {
    const data = event.data.text();
    console.log('[ServiceWorker] Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
      console.log('[ServiceWorker] Parsed notification data:', notificationData);
    } catch (parseError) {
      console.error('[ServiceWorker] Error parsing notification data:', parseError);
      throw new Error('Invalid notification data format');
    }

    // Get browser language and platform info
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');
    const isIOS = /iphone|ipad|ipod/.test(self.navigator.userAgent.toLowerCase());
    
    console.log('[ServiceWorker] User language:', userLang, 'Platform:', isIOS ? 'iOS' : 'Other');

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        messageId: notificationData.message_id
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
      console.log('[ServiceWorker] Tracked notification received:', await trackResponse.json());
    } catch (trackError) {
      console.error('[ServiceWorker] Error tracking notification:', trackError);
    }

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(
        isArabic ? notificationData.title_ar : notificationData.title_en,
        baseOptions
      ).then(() => {
        console.log('[ServiceWorker] Notification shown successfully');
      }).catch(error => {
        console.error('[ServiceWorker] Error showing notification:', error);
        throw error;
      })
    );
  } catch (error) {
    console.error('[ServiceWorker] Error processing push notification:', error);
    throw error; // Re-throw to ensure the push event fails properly
  }
});

// Enhanced notification click handler with tracking
self.addEventListener('notificationclick', async (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  try {
    // Track the click event
    await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        notification: event.notification.data,
        action: 'click'
      })
    });
    console.log('[ServiceWorker] Tracked notification click');
  } catch (error) {
    console.error('[ServiceWorker] Error tracking notification click:', error);
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
      .catch(error => console.error('[ServiceWorker] Error handling notification click:', error))
  );
});

// Simple fetch event handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            return response || caches.match('/');
          });
      })
  );
});
