
import { handleNotificationClick } from '../notificationClickHandler.js';

describe('NotificationClickHandler', () => {
  beforeEach(() => {
    // Mock clients
    global.clients = {
      matchAll: jest.fn().mockResolvedValue([]),
      openWindow: jest.fn().mockResolvedValue(undefined)
    };

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true
    });

    // Mock navigator
    global.navigator = {
      platform: 'test',
      userAgent: 'test'
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('handleNotificationClick', () => {
    it('should track notification click', async () => {
      const mockEvent = {
        notification: {
          close: jest.fn(),
          data: {
            messageId: '123',
            url: 'https://example.com'
          },
          tag: 'test-tag'
        }
      };

      await handleNotificationClick(mockEvent);

      expect(fetch).toHaveBeenCalledWith('/api/track-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"event":"clicked"')
      });
      expect(mockEvent.notification.close).toHaveBeenCalled();
    });

    it('should focus existing window if available', async () => {
      const mockClient = {
        url: 'https://example.com',
        focus: jest.fn().mockResolvedValue(undefined)
      };

      global.clients.matchAll.mockResolvedValue([mockClient]);

      const mockEvent = {
        notification: {
          close: jest.fn(),
          data: {
            messageId: '123',
            url: 'https://example.com'
          },
          tag: 'test-tag'
        }
      };

      await handleNotificationClick(mockEvent);

      expect(mockClient.focus).toHaveBeenCalled();
      expect(global.clients.openWindow).not.toHaveBeenCalled();
    });

    it('should open new window if no matching client found', async () => {
      const mockEvent = {
        notification: {
          close: jest.fn(),
          data: {
            messageId: '123',
            url: 'https://example.com'
          },
          tag: 'test-tag'
        }
      };

      await handleNotificationClick(mockEvent);

      expect(global.clients.openWindow).toHaveBeenCalledWith('https://example.com');
    });
  });
});
