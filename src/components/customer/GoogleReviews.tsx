
import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { ReviewCarousel } from './ReviewCarousel';
import { ReviewSkeleton } from './review-states/ReviewSkeleton';
import { NoReviews } from './review-states/NoReviews';
import { ErrorState } from './review-states/ErrorState';
import { ReviewModal } from './review-modal/ReviewModal';
import { useReviews, Review } from './hooks/useReviews';
import { ReviewsHeader } from './review-section/ReviewsHeader';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function GoogleReviews() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { displayedReviews, isLoading, error, refetch } = useReviews(language);

  // Handle read more button click
  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث المراجعات' : 'Reviews have been updated',
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="w-full py-16">
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Section header with refresh button */}
        <div className="flex justify-between items-center mb-8">
          <ReviewsHeader />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </Button>
        </div>

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
          <ReviewCarousel reviews={displayedReviews} onReadMore={handleReadMoreClick} />
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
