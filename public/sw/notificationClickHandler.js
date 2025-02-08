
import { log, logError } from './logger.js';

export const handleNotificationClick = async (event) => {
  log('Notification clicked', {
    tag: event.notification.tag,
    data: event.notification.data
  });
  
  event.notification.close();
  
  try {
    // Track the click
    await fetch('/api/track-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'clicked',
        messageId: event.notification.data.messageId,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          os: self.navigator?.platform || 'unknown',
          browser: self.navigator?.userAgent || 'unknown',
          version: '1.0.0'
        },
        platform: getPlatformType(),
        action: event.action || 'default'
      })
    });

    // Try to focus existing window
    const windowClients = await clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    });
    
    for (let client of windowClients) {
      if (client.url === event.notification.data.url && 'focus' in client) {
        return client.focus();
      }
    }
    
    // If no window exists, open new one
    if (clients.openWindow) {
      return clients.openWindow(event.notification.data.url);
    }
  } catch (error) {
    logError('Error handling notification click:', error);
  }
};

const getPlatformType = () => {
  const userAgent = self.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'web';
};
