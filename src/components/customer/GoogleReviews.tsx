
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchBranchesWithGooglePlaces, fetchBranchReviews, GoogleReview } from '@/services/googlePlacesService';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import { ReviewCarousel } from './ReviewCarousel';

// Interface for a review with branch information
interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string;
}

// Skeleton loader for reviews
const ReviewSkeleton = () => (
  <div className="flex-grow-0 flex-shrink-0 basis-[90%] sm:basis-[45%] md:basis-[31%] pl-4">
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col border border-gray-100">
      <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16 mb-2" />
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-4 h-4 mx-0.5" />)}
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// Empty state component when no reviews are found
const NoReviews = ({
  language
}: {
  language: string;
}) => (
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

// Error state component
const ErrorState = ({
  error,
  language
}: {
  error: string;
  language: string;
}) => (
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

export default function GoogleReviews() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const allReviewsPool = useRef<Review[]>([]);
  
  // Set a higher stale time for better caching (15 minutes)
  const CACHE_STALE_TIME = 15 * 60 * 1000;

  // Fetch branches with Google Places configuration
  const {
    data: branches,
    isLoading: isBranchesLoading,
    error: branchesError
  } = useQuery({
    queryKey: ['branches-with-google-places'],
    queryFn: fetchBranchesWithGooglePlaces,
    staleTime: CACHE_STALE_TIME
  });

  // Function to fetch reviews for all branches
  const fetchAllBranchReviews = useCallback(async () => {
    if (!branches || branches.length === 0) {
      logger.debug("No branches with Google Places configuration found");
      return [];
    }
    logger.debug(`Fetching reviews for ${branches.length} branches... Lang: ${language}`);
    setError(null);
    const allReviews: Review[] = [];
    try {
      for (const branch of branches) {
        if (!branch.google_place_id) {
          logger.warn(`Skipping branch ${branch.name} due to missing Place ID`);
          continue;
        }
        logger.debug(`Fetching reviews for branch: ${branch.name}`);
        const response = await fetchBranchReviews(branch.google_place_id, language);
        if (response.status === 'OK' && response.reviews && response.reviews.length > 0) {
          // Don't filter for 5-star reviews only, get all 4+ star reviews
          const branchReviews = response.reviews
            .filter(review => review.rating >= 4)
            .map(review => ({
              ...review,
              branch_name: branch.name,
              branch_name_ar: branch.name_ar
            }));
          logger.debug(`Found ${branchReviews.length} quality reviews for branch ${branch.name}`);
          allReviews.push(...branchReviews);
        } else {
          logger.debug(`No quality reviews or error for branch ${branch.name}: ${response.error || response.error_message || 'No reviews returned'}`);
        }
      }
      return allReviews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      logger.error('Error fetching all branch reviews:', errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [branches, language]);

  // Query for fetching all reviews with increased cache time
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    error: reviewsError
  } = useQuery({
    queryKey: ['google-reviews', language, branches],
    queryFn: fetchAllBranchReviews,
    enabled: !!branches && branches.length > 0,
    staleTime: CACHE_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Get a random selection of reviews from the pool
  const getRandomReviews = useCallback((pool: Review[], count: number) => {
    if (pool.length <= count) return [...pool];
    
    // Create a copy of the pool
    const shuffled = [...pool];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }, []);

  // Process and store all reviews when data changes
  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      logger.debug(`Total quality reviews fetched: ${reviewsData.length}`);
      
      // Store all reviews in our pool
      allReviewsPool.current = reviewsData;
      
      // Get 8 random reviews for the initial display
      const randomSelection = getRandomReviews(reviewsData, 12);
      setReviews(randomSelection);
      
      // Set initial display reviews
      setDisplayedReviews(randomSelection);
    } else if (reviewsData) {
      logger.debug("No quality reviews found across all branches.");
      setReviews([]);
      setDisplayedReviews([]);
    }
  }, [reviewsData, getRandomReviews]);
  
  useEffect(() => {
    if (reviewsError) {
      const errorMessage = reviewsError instanceof Error ? reviewsError.message : 'Unknown error fetching reviews';
      setError(errorMessage);
      logger.error('Reviews error:', errorMessage);
    } else if (branchesError) {
      const errorMessage = branchesError instanceof Error ? branchesError.message : 'Unknown error fetching branches';
      setError(errorMessage);
      logger.error('Branches error:', errorMessage);
    }
  }, [reviewsError, branchesError]);

  // Handle read more button click
  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };
  
  const isLoading = isBranchesLoading || isReviewsLoading;
  
  return (
    <div className="w-full py-16">
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Section header with gold accent */}
        <div className="text-center mb-10">
          <div className="inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#222222] relative">
              <span className="relative z-10">
                {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#C4A36F]/20 transform -rotate-1 z-0"></span>
            </h2>
          </div>
          <p className="mt-4 text-gray-600 max-w-lg mx-auto">
            {language === 'ar' 
              ? 'اكتشف تجارب عملائنا الحقيقية وآرائهم الصادقة حول خدماتنا' 
              : 'Discover authentic experiences and honest feedback from our valued customers'}
          </p>
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
        {error && !isLoading && <ErrorState error={error} language={language} />}

        {/* Empty State */}
        {!isLoading && !error && displayedReviews.length === 0 && <NoReviews language={language} />}

        {/* Reviews Display */}
        {!isLoading && !error && displayedReviews.length > 0 && (
          <ReviewCarousel reviews={displayedReviews} onReadMore={handleReadMoreClick} />
        )}
        
        {/* Read More Modal */}      
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <div className="flex-1">{selectedReview?.author_name}</div>
                <div className="flex items-center">
                  {[...Array(selectedReview?.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />)}
                </div>
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar' ? selectedReview?.branch_name_ar : selectedReview?.branch_name}
              </p>
            </DialogHeader>
            <DialogDescription className="mt-4 whitespace-pre-wrap text-gray-700">
              {selectedReview?.text}
            </DialogDescription>
            <Button onClick={() => setIsModalOpen(false)} className="mt-4 w-full sm:w-auto sm:ml-auto bg-[#C4A36F] hover:bg-[#A3845A]">
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
