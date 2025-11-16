import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MarketingErrorBoundaryProps {
  children: React.ReactNode;
  fallbackType: 'menu' | 'offers';
}

const MarketingErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
  type: 'menu' | 'offers';
}> = ({ error, resetErrorBoundary, type }) => {
  const { t } = useLanguage();

  const getContent = () => {
    if (type === 'menu') {
      return {
        title: t('menu.error.title') || 'Menu Unavailable',
        message: t('menu.error.message') || 'We\'re having trouble loading the menu right now. Please try again.',
        retryText: t('menu.error.retry') || 'Try Again'
      };
    } else {
      return {
        title: t('offers.error.title') || 'Offers Unavailable',
        message: t('offers.error.message') || 'We\'re having trouble loading the special offers right now. Please try again.',
        retryText: t('offers.error.retry') || 'Try Again'
      };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <Card className="w-full max-w-md mx-auto border-amber-200 bg-amber-50/50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {content.message}
          </p>
          <Button
            onClick={resetErrorBoundary}
            className="bg-[#C4A36F] hover:bg-[#B3935F] text-white"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {content.retryText}
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Custom Error Boundary class component
class MarketingErrorBoundaryClass extends React.Component<
  MarketingErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: MarketingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring (in production, send to error reporting service)
    console.error('Marketing content error:', error, errorInfo);

    // Could send to analytics/error reporting service here
    // Example: analytics.track('marketing_error', { error: error.message, type: this.props.fallbackType });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Clear any cached error state or retry logic
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <MarketingErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
          type={this.props.fallbackType}
        />
      );
    }

    return this.props.children;
  }
}

export const MarketingErrorBoundary = MarketingErrorBoundaryClass;
