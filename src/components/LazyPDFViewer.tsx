import React, { Suspense, lazy } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load the PDFViewer component
const PDFViewer = lazy(() => import('./pdf-viewer/PDFViewer'));

interface LazyPDFViewerProps {
  pdfUrl: string;
  className?: string;
  height?: string;
  variant?: 'default' | 'dialog';
}

const PDFViewerSkeleton: React.FC<{ variant: 'default' | 'dialog' }> = ({ variant }) => {
  const { t } = useLanguage();

  if (variant === 'dialog') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FBF7F2] rounded-xl">
        <div className="w-20 h-20 border-4 border-[#C4A36F]/30 border-t-[#C4A36F] rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-600">
          {t('pdf.viewer.loading') || 'Loading PDF...'}
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full border-[#C4A36F]/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-full max-w-md space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t('pdf.viewer.loading') || 'Loading PDF...'}
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C4A36F]"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LazyPDFViewerErrorFallback: React.FC<{ error: Error; retry: () => void; variant: 'default' | 'dialog' }> = ({ error, retry, variant }) => {
  const { t } = useLanguage();

  if (variant === 'dialog') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/60 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-red-700 mb-2">
          {t('pdf.viewer.error.title') || 'PDF Loading Error'}
        </p>
        <p className="text-sm text-red-600 mb-4 max-w-xs">
          {t('pdf.viewer.error.message') || 'Unable to load the PDF document. Please try again.'}
        </p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          {t('pdf.viewer.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <Card className="w-full border-red-200 bg-red-50/50">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {t('pdf.viewer.error.title') || 'PDF Loading Error'}
            </h3>
            <p className="text-sm text-red-600 mb-4 max-w-sm">
              {t('pdf.viewer.error.message') || 'Unable to load the PDF document. Please try again.'}
            </p>

            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              {t('pdf.viewer.retry') || 'Retry'}
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 w-full max-w-sm">
              <summary className="cursor-pointer text-xs text-red-500 hover:text-red-700">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-20">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({ pdfUrl, className, height, variant = 'default' }) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <Suspense fallback={<PDFViewerSkeleton variant={variant} />}>
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <LazyPDFViewerErrorFallback error={error} retry={handleRetry} variant={variant} />
        )}
        resetKeys={[retryKey]}
      >
        <PDFViewer key={retryKey} pdfUrl={pdfUrl} className={className} height={height} variant={variant} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple Error Boundary component for the PDF viewer
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; FallbackComponent: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PDF Viewer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
