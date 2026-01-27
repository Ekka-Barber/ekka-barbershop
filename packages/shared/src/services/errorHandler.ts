import { logger } from '@shared/utils/logger';

/**
 * Global Error Handler Service
 * Provides centralized error handling, logging, and monitoring
 */

export interface ErrorContext {
  source:
    | 'query'
    | 'mutation'
    | 'component'
    | 'api'
    | 'auth'
    | 'navigation'
    | 'unknown';
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

class ErrorHandlerService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  /**
   * Log error with context information
   */
  logError(error: Error | string, context?: ErrorContext): AppError {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      severity: this.determineSeverity(error, context),
      timestamp: new Date().toISOString(),
      context,
      originalError: typeof error === 'string' ? undefined : error,
    };

    // Add to queue for potential batch sending
    this.addToQueue(appError);

    // Log to console in development
    if (this.isDevelopment) {
      logger.error(
        `🚨 Error [${appError.severity.toUpperCase()}]: ${appError.message}`,
        {
          context: appError.context,
          stack: appError.originalError?.stack,
        }
      );
    }

    // In production, you would send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoringService(appError);
    }

    return appError;
  }

  /**
   * Handle API errors with standardized format
   */
  handleApiError(error: unknown, context?: Partial<ErrorContext>): AppError {
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      // Handle Supabase/API error formats
      const apiError = error as Record<string, unknown>;
      message =
        (apiError.message as string) ||
        (apiError.error_description as string) ||
        message;
      code = (apiError.code as string) || (apiError.error as string) || code;
    }

    return this.logError(new Error(message), {
      source: 'api',
      ...context,
      metadata: {
        errorCode: code,
        ...context?.metadata,
      },
    });
  }

  /**
   * Handle React Query errors
   */
  handleQueryError(error: unknown, queryKey?: string[]): AppError {
    return this.handleApiError(error, {
      source: 'query',
      action: queryKey?.join('.') || 'unknown_query',
    });
  }

  /**
   * Handle React Query mutation errors
   */
  handleMutationError(error: unknown, mutationKey?: string): AppError {
    return this.handleApiError(error, {
      source: 'mutation',
      action: mutationKey || 'unknown_mutation',
    });
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: unknown, action?: string): AppError {
    return this.handleApiError(error, {
      source: 'auth',
      action: action || 'auth_operation',
    });
  }

  /**
   * Handle component errors (for Error Boundaries)
   */
  handleComponentError(
    error: Error,
    componentName?: string,
    errorInfo?: React.ErrorInfo
  ): AppError {
    return this.logError(error, {
      source: 'component',
      action: 'component_render',
      metadata: {
        componentName,
        componentStack: errorInfo?.componentStack,
      },
    });
  }

  /**
   * Create user-friendly error messages
   */
  getUserFriendlyMessage(error: AppError): string {
    const { context, message } = error;

    // Authentication errors
    if (context?.source === 'auth') {
      if (message.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (message.includes('Email not confirmed')) {
        return 'Please check your email and confirm your account.';
      }
      return 'Authentication failed. Please try logging in again.';
    }

    // API errors
    if (
      context?.source === 'api' ||
      context?.source === 'query' ||
      context?.source === 'mutation'
    ) {
      if (message.includes('Network')) {
        return 'Network connection issue. Please check your internet connection.';
      }
      if (message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      if (message.includes('permission') || message.includes('unauthorized')) {
        return 'You do not have permission to perform this action.';
      }
      return 'Something went wrong. Please try again.';
    }

    // Component errors
    if (context?.source === 'component') {
      return 'A component error occurred. Please refresh the page.';
    }

    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine error severity based on error type and context
   */
  private determineSeverity(
    error: Error | string,
    context?: ErrorContext
  ): AppError['severity'] {
    const message = typeof error === 'string' ? error : error.message;

    // Critical errors
    if (
      context?.source === 'auth' ||
      message.includes('database') ||
      message.includes('server') ||
      message.includes('critical')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      context?.source === 'mutation' ||
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      context?.source === 'query' ||
      context?.source === 'component' ||
      message.includes('network') ||
      message.includes('timeout')
    ) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  }

  /**
   * Add error to queue for batch processing
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Send error to monitoring service (placeholder for production)
   */
  private sendToMonitoringService(error: AppError): void {
    // In production, implement actual monitoring service integration
    // Examples: Sentry, LogRocket, Datadog, etc.
    logger.warn('Error would be sent to monitoring service:', error);
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): AppError[] {
    return this.errorQueue.slice(-limit);
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<AppError['severity'], number>;
    bySource: Record<string, number>;
  } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      bySource: {} as Record<string, number>,
    };

    this.errorQueue.forEach((error) => {
      stats.bySeverity[error.severity]++;
      const source = error.context?.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerService();

// Export types for use in other files
export type { ErrorHandlerService };
