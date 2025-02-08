
self.addEventListener('push', (event) => {
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
  }).catch(console.error); // Don't wait for tracking

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
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      isArabic ? data.title_ar : data.title_en,
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
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
  }).catch(console.error); // Don't wait for tracking

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
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
    }).catch(console.error)
  );
});
