
/**
 * Centralized logging utility to control console output based on environment
 */

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configuration (can be expanded with more options later)
interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
}

// Default configuration
const config: LoggerConfig = {
  // In production, only show warnings and errors by default
  minLevel: isDevelopment ? 'debug' : 'warn',
  // Enable logging by default, but can be turned off completely
  enabled: true
};

// Level priority (higher number = more important)
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Check if we should log at the given level
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return levelPriority[level] >= levelPriority[config.minLevel];
};

// Logger functions
export const logger = {
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  // Configure the logger
  configure: (newConfig: Partial<LoggerConfig>): void => {
    Object.assign(config, newConfig);
  },
  
  // Disable all logging
  disable: (): void => {
    config.enabled = false;
  },
  
  // Enable logging
  enable: (): void => {
    config.enabled = true;
  }
};

// Expose a development-only logger that does nothing in production
export const devLogger = isDevelopment ? logger : {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  configure: () => {},
  disable: () => {},
  enable: () => {}
};
