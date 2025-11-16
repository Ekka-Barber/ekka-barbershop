import React, { Suspense, lazy } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MarketingDialogProps } from './MarketingDialog';

// Lazy load the MarketingDialog component
const MarketingDialog = lazy(() => import('./MarketingDialog').then(mod => ({ default: mod.MarketingDialog })));

const MarketingDialogSkeleton: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C4A36F]"></div>
            <span className="text-sm text-gray-600">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LazyMarketingDialog: React.FC<MarketingDialogProps> = (props) => {
  return (
    <Suspense fallback={<MarketingDialogSkeleton />}>
      <MarketingDialog {...props} />
    </Suspense>
  );
};
