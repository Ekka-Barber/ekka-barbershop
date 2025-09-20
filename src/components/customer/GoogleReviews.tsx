import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { ReviewCarousel } from './ReviewCarousel';
import { ReviewSkeleton } from './review-states/ReviewSkeleton';
import { NoReviews } from './review-states/NoReviews';
import { ErrorState } from './review-states/ErrorState';
import { ReviewModal } from './review-modal/ReviewModal';
import { useReviews, Review } from './hooks/useReviews';
import { ReviewsHeader } from './review-section/ReviewsHeader';
import { motion } from 'framer-motion';

export default function GoogleReviews() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { displayedReviews, isLoading, error } = useReviews(language);

  // Handle read more button click
  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  return (
    <motion.div 
      className="w-full pt-2 pb-0 mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut"
      }}
    >
      <motion.div 
        className="max-w-5xl mx-auto px-4 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
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

        {/* Reviews Display */}
        {!isLoading && !error && displayedReviews.length > 0 && (
          <ReviewCarousel 
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
      </motion.div>
    </motion.div>
  );
}

