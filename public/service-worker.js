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

// Enhanced push event with platform-specific handling and proper tracking
self.addEventListener('push', (event) => {
  try {
    const data = event.data.text();
    console.log('Received push event with data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing notification data:', parseError);
      return;
    }
    
    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');
    const userAgent = self.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Track notification received using absolute URL
    fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'received',
        notification: notificationData,
        subscription: {
          endpoint: self.registration.pushManager.getSubscription().then(sub => sub?.endpoint)
        },
        platform: isIOS ? 'ios' : 'android',
        delivery_status: 'delivered'
      })
    }).catch(error => {
      console.error('Error tracking notification received:', error);
    });

    // Platform-specific notification options
    const baseOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        message_id: notificationData.message_id,
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
        vibrate: [50, 50],
        sound: 'default'
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
        isArabic ? notificationData.title_ar : notificationData.title_en,
        baseOptions
      )
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Enhanced notification click handling with proper tracking
self.addEventListener('notificationclick', (event) => {
  try {
    const messageId = event.notification.data.message_id;
    console.log('Notification clicked with message_id:', messageId);

    fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'clicked',
        action: event.action,
        notification: {
          message_id: messageId,
          ...event.notification.data
        },
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
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
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
