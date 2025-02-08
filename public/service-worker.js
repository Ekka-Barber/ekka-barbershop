
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(filesToCache);
      })
      .catch(error => console.error('Cache installation failed:', error))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Enhanced push event focused on mobile
self.addEventListener('push', (event) => {
  try {
    console.log('Received push event');
    const data = event.data.text();
    let notificationData;
    
    try {
      notificationData = JSON.parse(data);
      console.log('Parsed notification data:', notificationData);
    } catch (parseError) {
      console.error('Error parsing notification data:', parseError);
      return;
    }

    // Get browser language and platform info
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');
    const isIOS = /iphone|ipad|ipod/.test(self.navigator.userAgent.toLowerCase());

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
      },
      vibrate: isIOS ? [50, 50] : [100, 50, 100],
      renotify: true,
      tag: 'ekka-notification'
    };

    event.waitUntil(
      self.registration.showNotification(
        isArabic ? notificationData.title_ar : notificationData.title_en,
        baseOptions
      ).catch(error => {
        console.error('Error showing notification:', error);
      })
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Simplified notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
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
      .catch(error => console.error('Error handling notification click:', error))
  );
});

// Simplified fetch event
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
