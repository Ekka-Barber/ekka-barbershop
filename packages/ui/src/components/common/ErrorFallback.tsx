import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/components/button';

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  componentName?: string;
  resetError: () => void;
  showErrorDetails?: boolean;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  componentName,
  resetError,
  showErrorDetails = true, // Always show in production for debugging
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Please try refreshing the page
            or go back to the home page.
          </p>
          {componentName && (
            <p className="text-sm text-gray-500">
              Error in component: {componentName}
            </p>
          )}
        </div>

        {/* Error Details */}
        {showErrorDetails && error && (
          <div className="bg-gray-50 border rounded-lg p-4 text-left">
            <details className="space-y-2">
              <summary className="font-medium text-gray-700 cursor-pointer">
                Error Details
              </summary>
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={resetError}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={handleReload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </Button>
          <Button onClick={handleGoHome} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};
