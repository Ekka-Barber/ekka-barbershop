
// Cache name for offline support
const CACHE_NAME = 'ekka-v1';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(filesToCache))
      .catch(error => console.error('Cache installation failed:', error))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page or fallback content
        return caches.match('/');
      })
  );
});

self.addEventListener('push', (event) => {
  try {
    const data = JSON.parse(event.data.text());
    
    // Get browser language
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');

    // Track notification received
    fetch(`${self.registration.scope}functions/v1/track-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'received',
        subscription: self.registration.pushManager.getSubscription(),
        notification: data
      })
    }).catch(error => console.error('Error tracking notification received:', error));

    const options = {
      body: isArabic ? data.body_ar : data.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || 'https://ekka.lovableproject.com/offers',
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'open',
          title: isArabic ? 'فتح' : 'Open',
        },
        {
          action: 'close',
          title: isArabic ? 'إغلاق' : 'Close',
        }
      ],
      tag: 'ekka-notification', // Ensure only one notification is shown at a time
      renotify: true // Vibrate and alert even if a notification with the same tag is already being shown
    };

    event.waitUntil(
      self.registration.showNotification(
        isArabic ? data.title_ar : data.title_en,
        options
      ).catch(error => console.error('Error showing notification:', error))
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  try {
    // Track notification click
    fetch(`${self.registration.scope}functions/v1/track-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        action: event.action,
        notification: event.notification.data
      })
    }).catch(error => console.error('Error tracking notification click:', error));

    event.notification.close();

    if (event.action === 'close') {
      return;
    }

    // Focus or open window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          // Check if there is already a window/tab open with the target URL
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is open, open one
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
        .catch(error => console.error('Error handling notification click:', error))
    );
  } catch (error) {
    console.error('Error in notification click handler:', error);
  }
});

// Handle subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    fetch(`${self.registration.scope}functions/v1/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldSubscription: event.oldSubscription?.toJSON(),
        newSubscription: event.newSubscription?.toJSON()
      })
    }).catch(error => console.error('Error updating subscription:', error))
  );
});
