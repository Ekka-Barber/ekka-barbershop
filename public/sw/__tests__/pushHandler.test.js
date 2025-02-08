
import { handlePushEvent } from '../pushHandler.js';
import { addToQueue } from '../notificationQueue.js';

jest.mock('../notificationQueue.js');

describe('PushHandler', () => {
  beforeEach(() => {
    // Mock registration
    global.registration = {
      showNotification: jest.fn().mockResolvedValue(undefined)
    };

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });

    // Mock navigator
    global.navigator = {
      onLine: true,
      platform: 'test',
      userAgent: 'test'
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('handlePushEvent', () => {
    it('should show notification when online and valid payload', async () => {
      const mockEvent = {
        data: {
          text: () => JSON.stringify({
            title: 'Test Title',
            body: 'Test Body',
            message_id: '123'
          })
        }
      };

      await handlePushEvent(mockEvent);

      expect(global.registration.showNotification).toHaveBeenCalledWith(
        'Test Title',
        expect.objectContaining({
          body: 'Test Body',
          data: expect.objectContaining({
            messageId: '123'
          })
        })
      );
    });

    it('should queue notification when offline', async () => {
      global.navigator.onLine = false;

      const mockEvent = {
        data: {
          text: () => JSON.stringify({
            title: 'Test Title',
            body: 'Test Body',
            message_id: '123'
          })
        }
      };

      await handlePushEvent(mockEvent);

      expect(addToQueue).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Title',
        options: expect.objectContaining({
          body: 'Test Body'
        })
      }));
    });

    it('should handle invalid payload', async () => {
      const mockEvent = {
        data: {
          text: () => 'invalid json'
        }
      };

      await expect(handlePushEvent(mockEvent)).rejects.toThrow('INVALID_PAYLOAD');
    });
  });
});
