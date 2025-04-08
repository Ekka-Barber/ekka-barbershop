/**
 * A no-op logger that prevents all console logging
 */
export const logger = {
  /**
   * Configure the logger (no-op)
   */
  configure: () => {},
  
  /**
   * Log debug information (no-op)
   */
  debug: () => {},
  
  /**
   * Log informational messages (no-op)
   */
  info: () => {},
  
  /**
   * Log warning messages (no-op)
   */
  warn: () => {},
  
  /**
   * Log error messages (no-op)
   */
  error: () => {},
  
  /**
   * Group related logs together (no-op)
   */
  group: () => {}
};
