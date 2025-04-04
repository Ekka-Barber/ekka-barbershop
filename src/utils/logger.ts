
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
  maskSensitiveData?: boolean;
}

// Default configuration
let config: LoggerConfig = {
  minLevel: 'debug',
  enabled: true,
  maskSensitiveData: true
};

// Log level priorities (higher number = more important)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Patterns to detect sensitive data (API keys, tokens, etc.)
const SENSITIVE_PATTERNS = [
  /(api[_-]?key|apikey|key|token|secret|password|auth)[:=]["']?\w{20,}["']?/gi,
  /AIza[0-9A-Za-z\-_]{35}/g, // Google API Key pattern
  /sk_live_[0-9a-zA-Z]{24}/g, // Stripe Secret Key pattern
];

/**
 * Mask sensitive data in objects or strings
 */
const maskSensitiveData = (data: any): any => {
  if (!config.maskSensitiveData) return data;
  
  if (typeof data === 'string') {
    return data.replace(SENSITIVE_PATTERNS[0], '$1: "***REDACTED***"')
               .replace(SENSITIVE_PATTERNS[1], '***REDACTED_GOOGLE_API_KEY***')
               .replace(SENSITIVE_PATTERNS[2], '***REDACTED_STRIPE_KEY***');
  }
  
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => maskSensitiveData(item));
    }
    
    const maskedObject: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Mask values for keys that may contain sensitive information
      if (/api[_-]?key|apikey|key|token|secret|password|auth/i.test(key)) {
        maskedObject[key] = '***REDACTED***';
      } else {
        maskedObject[key] = maskSensitiveData(value);
      }
    }
    return maskedObject;
  }
  
  return data;
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
      data !== undefined ? maskSensitiveData(data) : ''
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
      data !== undefined ? maskSensitiveData(data) : ''
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
      data !== undefined ? maskSensitiveData(data) : ''
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
      error !== undefined ? maskSensitiveData(error) : ''
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
