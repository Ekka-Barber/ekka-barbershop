import { logger } from '@shared/utils/logger';

export interface ErrorContext {
  source: 'query' | 'mutation' | 'component' | 'api' | 'auth' | 'navigation' | 'unknown';
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface AppError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  context?: ErrorContext;
  originalError?: Error;
}

type SeverityRule = {
  test: (msg: string, ctx?: ErrorContext) => boolean;
  severity: AppError['severity'];
};

type UserMessageRule = {
  test: (msg: string, ctx?: ErrorContext) => boolean;
  message: string;
};

const SEVERITY_RULES: SeverityRule[] = [
  { test: (msg, ctx) => ctx?.source === 'auth' || msg.includes('database') || msg.includes('critical'), severity: 'critical' },
  { test: (msg, ctx) => ctx?.source === 'mutation' || msg.includes('permission') || msg.includes('unauthorized'), severity: 'high' },
  { test: (msg, ctx) => ctx?.source === 'query' || ctx?.source === 'component' || msg.includes('network'), severity: 'medium' },
  { test: () => true, severity: 'low' },
];

const USER_MESSAGES: UserMessageRule[] = [
  { test: (msg, ctx) => ctx?.source === 'auth' && msg.includes('Invalid login'), message: 'Invalid email or password. Please try again.' },
  { test: (msg, ctx) => ctx?.source === 'auth' && msg.includes('Email not confirmed'), message: 'Please check your email and confirm your account.' },
  { test: (_, ctx) => ctx?.source === 'auth', message: 'Authentication failed. Please try logging in again.' },
  { test: (msg) => msg.includes('Network'), message: 'Network connection issue. Please check your internet connection.' },
  { test: (msg) => msg.includes('timeout'), message: 'Request timed out. Please try again.' },
  { test: (msg) => msg.includes('permission') || msg.includes('unauthorized'), message: 'You do not have permission to perform this action.' },
  { test: (_, ctx) => ctx?.source === 'api' || ctx?.source === 'query' || ctx?.source === 'mutation', message: 'Something went wrong. Please try again.' },
  { test: (_, ctx) => ctx?.source === 'component', message: 'A component error occurred. Please refresh the page.' },
  { test: () => true, message: 'An unexpected error occurred. Please try again.' },
];

class ErrorHandlerService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  logError(error: Error | string, context?: ErrorContext): AppError {
    const message = typeof error === 'string' ? error : error.message;
    const severity = SEVERITY_RULES.find(rule => rule.test(message, context))?.severity || 'low';
    
    const appError: AppError = {
      message,
      severity,
      timestamp: new Date().toISOString(),
      context,
      originalError: typeof error === 'string' ? undefined : error,
    };

    this.addToQueue(appError);

    if (this.isDevelopment) {
      logger.error(`[${appError.severity.toUpperCase()}] ${appError.message}`, {
        context: appError.context,
        stack: appError.originalError?.stack,
      });
    } else {
      this.sendToMonitoringService(appError);
    }

    return appError;
  }

  handle(error: unknown, context?: Partial<ErrorContext> & { action?: string }): AppError {
    let message = 'An unexpected error occurred';
    let code: string | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      const apiError = error as Record<string, unknown>;
      message = (apiError.message as string) || (apiError.error_description as string) || message;
      code = (apiError.code as string) || (apiError.error as string);
    }

    return this.logError(new Error(message), {
      source: 'api',
      ...context,
      metadata: { errorCode: code, ...context?.metadata },
    });
  }

  getUserFriendlyMessage(error: AppError): string {
    const rule = USER_MESSAGES.find(r => r.test(error.message, error.context));
    return rule?.message || 'An unexpected error occurred. Please try again.';
  }

  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private sendToMonitoringService(error: AppError): void {
    logger.warn('Error would be sent to monitoring service:', error);
  }

  getRecentErrors(limit = 10): AppError[] {
    return this.errorQueue.slice(-limit);
  }

  clearErrors(): void {
    this.errorQueue = [];
  }

  getErrorStats(): { total: number; bySeverity: Record<AppError['severity'], number>; bySource: Record<string, number> } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<AppError['severity'], number>,
      bySource: {} as Record<string, number>,
    };

    for (const error of this.errorQueue) {
      stats.bySeverity[error.severity]++;
      const source = error.context?.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    }

    return stats;
  }
}

export const errorHandler = new ErrorHandlerService();
export type { ErrorHandlerService };
