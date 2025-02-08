
import { log, logError } from './logger.js';
import { addToQueue } from './notificationQueue.js';

const RATE_LIMIT_PER_DAY = 50;

export const handlePushEvent = async (event) => {
  log('Push received');
  
  try {
    const data = event.data.text();
    log('Push data:', data);
    
    let notificationData;
    try {
      notificationData = JSON.parse(data);
    } catch (error) {
      throw new Error('INVALID_PAYLOAD');
    }

    if (!notificationData.title || !notificationData.body) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const deviceInfo = {
      os: self.navigator?.platform || 'unknown',
      browser: self.navigator?.userAgent || 'unknown',
      version: '1.0.0',
      online: navigator.onLine
    };

    if (!navigator.onLine) {
      log('Device offline, queueing notification');
      await addToQueue({
        title: notificationData.title,
        options: {
          body: notificationData.body,
          icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
          badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
          data: {
            url: notificationData.url || 'https://ekka.lovableproject.com/offers',
            messageId: notificationData.message_id,
            timestamp: Date.now()
          },
          requireInteraction: true,
          tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
          ...(notificationData.platform_data || {})
        },
        deviceInfo
      });
      return;
    }

    // Check rate limit
    const rateLimitCheck = await fetch('/api/check-rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: self.registration.pushManager.getSubscription().endpoint
      })
    });

    if (!rateLimitCheck.ok) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    // Show notification
    await self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      badge: '/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png',
      data: {
        url: notificationData.url || 'https://ekka.lovableproject.com/offers',
        messageId: notificationData.message_id,
        timestamp: Date.now()
      },
      requireInteraction: true,
      tag: `ekka-notification-${notificationData.message_id || Date.now()}`,
      ...(notificationData.platform_data || {})
    });

    // Track successful delivery
    await fetch('/api/track-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'delivered',
        messageId: notificationData.message_id,
        timestamp: new Date().toISOString(),
        deviceInfo,
        platform: getPlatformType()
      })
    });

  } catch (error) {
    const errorType = error.message || 'UNKNOWN_ERROR';
    const retryable = !['RATE_LIMIT_EXCEEDED', 'INVALID_PAYLOAD', 'MISSING_REQUIRED_FIELDS'].includes(errorType);

    logError('Error showing notification:', {
      error,
      type: errorType,
      retryable
    });

    // Track failure
    await fetch('/api/track-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'failed',
        messageId: notificationData?.message_id,
        error: {
          type: errorType,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          retryable
        },
        deviceInfo,
        platform: getPlatformType()
      })
    });
  }
};

const getPlatformType = () => {
  const userAgent = self.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'web';
};
