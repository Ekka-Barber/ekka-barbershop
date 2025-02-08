
// Cache name for offline support
const CACHE_NAME = 'ekka-v1';
const SW_VERSION = '1.0.0';

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
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating service worker');
  event.waitUntil(self.clients.claim());
});

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
      tag: `ekka-notification-${notificationData.message_id || Date.now()}`
    };

    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
        .then(() => log('Notification shown successfully'))
        .catch(error => logError('Error showing notification:', error))
    );
  } catch (error) {
    logError('Error handling push event:', error);
    throw error;
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked', {
    tag: event.notification.tag
  });
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Try to focus existing window
        for (let client of clientList) {
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

// Fetch event - Basic offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
