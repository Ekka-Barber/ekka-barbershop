
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

// Simplified push event handler
self.addEventListener('push', async (event) => {
  try {
    console.log('Push event received');
    const data = event.data.text();
    console.log('Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing notification data:', parseError);
      return;
    }

    // Get the subscription for tracking
    const subscription = await self.registration.pushManager.getSubscription();
    
    // Track notification received
    try {
      const trackResponse = await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'received',
          notification: notificationData,
          subscription: { endpoint: subscription?.endpoint },
          delivery_status: 'delivered'
        })
      });
      console.log('Tracking response:', await trackResponse.json());
    } catch (trackError) {
      console.error('Error tracking notification:', trackError);
    }

    const userLang = self.navigator?.language || 'en';
    const isArabic = userLang.startsWith('ar');

    const notificationOptions = {
      body: isArabic ? notificationData.body_ar : notificationData.body_en,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        message_id: notificationData.message_id,
        dateOfArrival: Date.now()
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
      renotify: true,
      requireInteraction: true,
      vibrate: [100, 50, 100]
    };

    event.waitUntil(
      self.registration.showNotification(
        isArabic ? notificationData.title_ar : notificationData.title_en,
        notificationOptions
      )
    );
  } catch (error) {
    console.error('Error in push event handler:', error);
  }
});

// Simplified notification click handler
self.addEventListener('notificationclick', (event) => {
  try {
    console.log('Notification clicked');
    const messageId = event.notification.data.message_id;

    // Track the click
    fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/track-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'clicked',
        action: event.action,
        notification: {
          message_id: messageId,
          ...event.notification.data
        }
      })
    }).catch(error => console.error('Error tracking click:', error));

    event.notification.close();

    if (event.action === 'close') return;

    // Open or focus window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          const url = event.notification.data.url;
          
          // Try to focus an existing window
          for (const client of windowClients) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  } catch (error) {
    console.error('Error in click handler:', error);
  }
});

// Handle subscription changes
self.addEventListener('pushsubscriptionchange', async (event) => {
  try {
    console.log('Subscription changed');
    const newSubscription = await event.target.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    });

    // Update subscription in backend
    await fetch('https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/update-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldSubscription: event.oldSubscription?.toJSON(),
        newSubscription: newSubscription.toJSON()
      })
    });
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
});
