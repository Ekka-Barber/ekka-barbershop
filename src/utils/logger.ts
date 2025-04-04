
// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

// Configure which log levels should show based on environment
const VISIBLE_LOG_LEVELS: Record<LogLevel, boolean> = {
  debug: isDevelopment,  // Only show debug logs in development
  info: true,            // Always show info logs
  warn: true,            // Always show warning logs
  error: true            // Always show error logs
};

// Logger configuration
interface LoggerConfig {
  minLevel?: LogLevel;
  enabled?: boolean;
}

// Default configuration
let config: LoggerConfig = {
  minLevel: 'debug',
  enabled: true
};

// Log level priorities (higher number = more important)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Structured logger that provides consistent formatting
 * and can be centrally configured to filter log levels
 */
export const logger = {
  /**
   * Configure the logger
   */
  configure: (newConfig: LoggerConfig) => {
    config = { ...config, ...newConfig };
  },
  
  /**
   * Log debug information (only visible in development)
   */
  debug: (message: string, data?: any) => {
    if (!VISIBLE_LOG_LEVELS.debug || !config.enabled || 
        LOG_LEVEL_PRIORITY.debug < LOG_LEVEL_PRIORITY[config.minLevel || 'debug']) return;
    
    console.debug(
      `%c[DEBUG]%c ${message}`,
      'color: #6b7280; font-weight: bold;',
      'color: #6b7280;',
      data !== undefined ? data : ''
    );
  },
  
  /**
   * Log informational messages
   */
  info: (message: string, data?: any) => {
    if (!VISIBLE_LOG_LEVELS.info || !config.enabled ||
        LOG_LEVEL_PRIORITY.info < LOG_LEVEL_PRIORITY[config.minLevel || 'debug']) return;
    
    console.info(
      `%c[INFO]%c ${message}`,
      'color: #3b82f6; font-weight: bold;',
      'color: inherit;',
      data !== undefined ? data : ''
    );
  },
  
  /**
   * Log warning messages
   */
  warn: (message: string, data?: any) => {
    if (!VISIBLE_LOG_LEVELS.warn || !config.enabled ||
        LOG_LEVEL_PRIORITY.warn < LOG_LEVEL_PRIORITY[config.minLevel || 'debug']) return;
    
    console.warn(
      `%c[WARN]%c ${message}`,
      'color: #f59e0b; font-weight: bold;',
      'color: inherit;',
      data !== undefined ? data : ''
    );
  },
  
  /**
   * Log error messages
   */
  error: (message: string, error?: any) => {
    if (!VISIBLE_LOG_LEVELS.error || !config.enabled ||
        LOG_LEVEL_PRIORITY.error < LOG_LEVEL_PRIORITY[config.minLevel || 'debug']) return;
    
    console.error(
      `%c[ERROR]%c ${message}`,
      'color: #ef4444; font-weight: bold;',
      'color: inherit;',
      error !== undefined ? error : ''
    );
  },
  
  /**
   * Group related logs together
   */
  group: (label: string, collapsed = false, fn: () => void) => {
    if (!config.enabled) return;
    
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
    
    fn();
    console.groupEnd();
  }
};
