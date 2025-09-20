
import { Star } from 'lucide-react';
import { Language } from '@/types/language';

interface ErrorStateProps {
  error: string;
  language: Language;
}

export const ErrorState = ({ error, language }: ErrorStateProps) => (
  <div className="w-full py-8 text-center">
    <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <Star className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-red-700 mb-2">
        {language === 'ar' ? 'حدث خطأ' : 'Error Loading Reviews'}
      </h3>
      <p className="text-red-500 text-sm">
        {language === 'ar' ? 'نعتذر، حدث خطأ أثناء تحميل المراجعات.' : 'Sorry, there was an error loading reviews.'}
      </p>
      <div className="mt-4 p-3 bg-red-100 rounded text-xs text-red-800 max-w-xs mx-auto overflow-hidden text-wrap break-words">
        {error}
      </div>
    </div>
  </div>
);
