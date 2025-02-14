
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error }: { error?: Error }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'عذراً! حدث خطأ ما' : 'Oops! Something went wrong'}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
            : 'We apologize for the inconvenience. Please try again.'}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm overflow-auto">
            {error.message}
          </pre>
        )}
        <div className="pt-4">
          <Button 
            onClick={() => {
              navigate('/');
              window.location.reload();
            }}
          >
            {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
          </Button>
        </div>
      </div>
    </div>
  );
};
