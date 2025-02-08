
// Cache name for offline support
const CACHE_NAME = 'ekka-v2';

// Files to cache for offline support
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add more static assets here
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
  
  // Activate the new service worker immediately
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
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache successful GET requests
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Return cached response or offline page
        return caches.match(event.request)
          .then(response => {
            return response || caches.match('/');
          });
      })
  );
});

// Enhanced push event with platform-specific handling
self.addEventListener('push', (event) => {
  try {
    const data = JSON.parse(event.data.text());
    
    // Get browser language and platform info
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');
    const userAgent = self.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Track notification received
    fetch(`${self.registration.scope}functions/v1/track-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'received',
        subscription: self.registration.pushManager.getSubscription(),
        notification: data,
        platform: isIOS ? 'ios' : 'android'
      })
    }).catch(error => console.error('Error tracking notification received:', error));

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? data.body_ar : data.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
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
      tag: 'ekka-notification',
      renotify: true
    };

    // iOS-specific options
    if (isIOS) {
      Object.assign(baseOptions, {
        vibrate: [50, 50], // Shorter vibration for iOS
        sound: 'default' // iOS notification sound
      });
    } else {
      // Android-specific options
      Object.assign(baseOptions, {
        vibrate: [100, 50, 100],
        requireInteraction: true,
        silent: false
      });
    }

    event.waitUntil(
      self.registration.showNotification(
        isArabic ? data.title_ar : data.title_en,
        baseOptions
      ).catch(error => {
        console.error('Error showing notification:', error);
        // Track error
        return fetch(`${self.registration.scope}functions/v1/track-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'error',
            error: error.message,
            notification: data
          })
        });
      })
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  try {
    // Track notification click with platform info
    fetch(`${self.registration.scope}functions/v1/track-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        action: event.action,
        notification: event.notification.data,
        platform: /iphone|ipad|ipod/.test(self.navigator.userAgent.toLowerCase()) ? 'ios' : 'android'
      })
    }).catch(error => console.error('Error tracking notification click:', error));

    event.notification.close();

    if (event.action === 'close') {
      return;
    }

    // Enhanced client focusing/opening
    event.waitUntil(
      clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true
      })
      .then(windowClients => {
        // Try to focus existing window first
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window exists, open new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url).then(windowClient => {
            // Wait for window to load and focus it
            if (windowClient) {
              return windowClient.focus();
            }
          });
        }
      })
      .catch(error => console.error('Error handling notification click:', error))
    );
  } catch (error) {
    console.error('Error in notification click handler:', error);
  }
});

// Enhanced subscription change handling
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    fetch(`${self.registration.scope}functions/v1/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldSubscription: event.oldSubscription?.toJSON(),
        newSubscription: event.newSubscription?.toJSON(),
        deviceType: /iphone|ipad|ipod/.test(self.navigator.userAgent.toLowerCase()) ? 'ios' : 'android'
      })
    }).catch(error => console.error('Error updating subscription:', error))
  );
});
