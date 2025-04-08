
/**
 * Custom logger utility that provides consistent logging across the application
 * with different log levels and formatting
 */

// Define log levels with corresponding styles for better visual distinction in the console
const LOG_STYLES = {
  debug: 'color: #6c757d; font-weight: normal;',
  info: 'color: #0d6efd; font-weight: normal;',
  warn: 'color: #ffc107; font-weight: bold;',
  error: 'color: #dc3545; font-weight: bold;'
};

// Create the logger object with methods for each log level
export const logger = {
  /**
   * Debug level logging for development information
   * Only outputs when in non-production environments
   */
  debug: (message: string, ...data: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c[DEBUG] ${message}`, LOG_STYLES.debug, ...data);
    }
  },

  /**
   * Standard info logging for general application flow information
   */
  info: (message: string, ...data: any[]) => {
    console.log(`%c[INFO] ${message}`, LOG_STYLES.info, ...data);
  },

  /**
   * Warning level logging for non-critical issues that should be addressed
   */
  warn: (message: string, ...data: any[]) => {
    console.warn(`%c[WARN] ${message}`, LOG_STYLES.warn, ...data);
  },

  /**
   * Error level logging for critical issues that affect functionality
   */
  error: (message: string, ...data: any[]) => {
    console.error(`%c[ERROR] ${message}`, LOG_STYLES.error, ...data);
  }
};
