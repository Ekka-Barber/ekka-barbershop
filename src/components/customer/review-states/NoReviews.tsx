
import { Star } from 'lucide-react';
import { Language } from '@/types/language';

interface NoReviewsProps {
  language: Language;
}

export const NoReviews = ({ language }: NoReviewsProps) => (
  <div className="w-full py-8 text-center">
    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {language === 'ar' ? 'لا توجد مراجعات متاحة' : 'No Reviews Available'}
      </h3>
      <p className="text-gray-500 text-sm">
        {language === 'ar' ? 'لم نتمكن من العثور على أي مراجعات في الوقت الحالي. الرجاء المحاولة مرة أخرى لاحقًا.' : 'We couldn\'t find any reviews at the moment. Please check back later.'}
      </p>
    </div>
  </div>
);
