/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/utils/logger";

interface Props {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Error in ${this.props.componentName || 'Unknown Component'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return <FallbackComponent 
          error={this.state.error as Error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />;
      }
      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        componentName={this.props.componentName}
        resetErrorBoundary={this.resetErrorBoundary} 
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  componentName?: string;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, errorInfo, componentName, resetErrorBoundary }: ErrorFallbackProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleRetry = () => {
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'عذراً! حدث خطأ ما' : 'Oops! Something went wrong'}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
            : 'We apologize for the inconvenience. Please try again.'}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm overflow-auto custom-scrollbar momentum-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
            {componentName && (
              <div className="font-semibold text-red-600 mb-2">
                Component: {componentName}
              </div>
            )}
            <div className="font-semibold text-red-600 mb-2">
              Error: {error.message}
            </div>
            {error.stack && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="font-semibold mb-1">Stack Trace:</div>
                {error.stack.split("\n").slice(1).join("\n")}
              </div>
            )}
            {errorInfo?.componentStack && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="font-semibold mb-1">Component Stack:</div>
                {errorInfo.componentStack}
              </div>
            )}
          </div>
        )}
        <div className="pt-4 space-x-3 rtl:space-x-reverse">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Go to Home'}
          </Button>
          <Button 
            onClick={handleRetry}
          >
            {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
          </Button>
        </div>
      </div>
    </div>
  );
};
