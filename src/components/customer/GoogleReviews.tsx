import { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { ReviewCarousel } from './ReviewCarousel';
import { ReviewSkeleton } from './review-states/ReviewSkeleton';
import { NoReviews } from './review-states/NoReviews';
import { ErrorState } from './review-states/ErrorState';
import { ReviewModal } from './review-modal/ReviewModal';
import { useReviews, Review } from './hooks/useReviews';
import { ReviewsHeader } from './review-section/ReviewsHeader';
import { logger } from '@/utils/logger';

export default function GoogleReviews() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  
  const { displayedReviews, isLoading, error } = useReviews(language);

  // Force re-render when language changes to ensure carousel layout updates
  useEffect(() => {
    logger.debug(`Language changed to ${language}, forcing carousel re-render`);
    setForceRenderKey(prev => prev + 1);
  }, [language]);

  // Handle read more button click
  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  return (
    <div className="w-full pt-2 pb-0 mb-0">
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Section header */}
        <ReviewsHeader />

        {/* Loading State */}
        {isLoading && (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {[...Array(3)].map((_, index) => <ReviewSkeleton key={`skeleton-${index}`} />)}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && <ErrorState error={typeof error === 'object' && error !== null ? String(error) : String(error)} language={language} />}

        {/* Empty State */}
        {!isLoading && !error && displayedReviews.length === 0 && <NoReviews language={language} />}

        {/* Reviews Display - key forces re-render on language change */}
        {!isLoading && !error && displayedReviews.length > 0 && (
          <ReviewCarousel 
            key={`carousel-${forceRenderKey}`}
            reviews={displayedReviews} 
            onReadMore={handleReadMoreClick} 
          />
        )}
        
        {/* Read More Modal */}      
        <ReviewModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedReview={selectedReview}
          language={language}
        />
      </div>
    </div>
  );
}

