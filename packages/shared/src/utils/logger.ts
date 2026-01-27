
/**
 * Custom logger utility that provides consistent logging across the application
 * with different log levels and formatting
 */

// Define log types and configuration
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LoggerConfig = {
  minLevel: LogLevel;
  enabled: boolean;
};

// Default configuration - enable logging in development, disable in production
let config: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  enabled: process.env.NODE_ENV !== 'production'
};

// Log level priority (higher number = higher priority)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Define log levels with corresponding styles for better visual distinction in the console
const LOG_STYLES = {
  debug: 'color: #6c757d; font-weight: normal;',
  info: 'color: #0d6efd; font-weight: normal;',
  warn: 'color: #ffc107; font-weight: bold;',
  error: 'color: #dc3545; font-weight: bold;'
};

// Check if log level should be displayed based on config
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
};

// Create the logger object with methods for each log level
export const logger = {
  /**
   * Configure the logger settings
   */
  configure: (options: Partial<LoggerConfig>) => {
    config = { ...config, ...options };
  },

  /**
   * Debug level logging for development information
   * Only outputs when in non-production environments and enabled in config
   */
  debug: (message: string, ...data: unknown[]) => {
    if (shouldLog('debug') && (process.env.NODE_ENV !== 'production')) {
      console.log(`%c[DEBUG] ${message}`, LOG_STYLES.debug, ...data);
    }
  },

  /**
   * Standard info logging for general application flow information
   */
  info: (message: string, ...data: unknown[]) => {
    if (shouldLog('info')) {
      console.log(`%c[INFO] ${message}`, LOG_STYLES.info, ...data);
    }
  },

  /**
   * Warning level logging for non-critical issues that should be addressed
   */
  warn: (message: string, ...data: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(`%c[WARN] ${message}`, LOG_STYLES.warn, ...data);
    }
  },

  /**
   * Error level logging for critical issues that affect functionality
   */
  error: (message: string, ...data: unknown[]) => {
    if (shouldLog('error')) {
      console.error(`%c[ERROR] ${message}`, LOG_STYLES.error, ...data);
    }
  }
};
