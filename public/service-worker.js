self.addEventListener('push', (event) => {
  const data = JSON.parse(event.data.text());
  
  // Get browser language
  const userLang = self.navigator?.language || 'en';
  const isArabic = userLang.startsWith('ar');

  const options = {
    body: isArabic ? data.body_ar : data.body_en,
    icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
    badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      isArabic ? data.title_ar : data.title_en,
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://ekka.lovableproject.com/offers')
  );
});