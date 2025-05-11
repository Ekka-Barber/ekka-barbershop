
import { log, logError } from '../logger.js';

describe('Logger', () => {
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    // Mock Date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe('log', () => {
    it('should log message with timestamp and version', () => {
      const message = 'Test message';
      const data = { test: true };
      
      log(message, data);
      
      expect(console.log).toHaveBeenCalledWith(
        '[ServiceWorker 1.0.0] 2024-01-01T00:00:00.000Z - Test message',
        { test: true }
      );
    });
  });

  describe('logError', () => {
    it('should log error with timestamp and version', () => {
      const message = 'Test error';
      const error = new Error('Something went wrong');
      
      logError(message, error);
      
      expect(console.error).toHaveBeenCalledWith(
        '[ServiceWorker 1.0.0] 2024-01-01T00:00:00.000Z - Test error',
        error
      );
    });
  });
});
