self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
    badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Ekka Barbershop', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://ekka.lovableproject.com/offers')
  );
});