
import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchBranchesWithGooglePlaces, fetchBranchReviews, GoogleReview } from '@/services/googlePlacesService';
import { Skeleton } from '@/components/ui/skeleton';

// Interface for a review with branch information
interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string;
}

// Skeleton loader for reviews
const ReviewSkeleton = () => (
  <div className="flex-grow-0 flex-shrink-0 basis-[90%] sm:basis-[45%] md:basis-[31%]">
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col border border-gray-100">
      <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16 mb-2" />
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 mx-0.5" />
            ))}
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
const NoReviews = ({ language }: { language: string }) => (
  <div className="w-full py-8 text-center">
    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {language === 'ar' ? 'لا توجد مراجعات متاحة' : 'No Reviews Available'}
      </h3>
      <p className="text-gray-500 text-sm">
        {language === 'ar' 
          ? 'لم نتمكن من العثور على أي مراجعات في الوقت الحالي. الرجاء المحاولة مرة أخرى لاحقًا.'
          : 'We couldn\'t find any reviews at the moment. Please check back later.'}
      </p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error, language }: { error: string, language: string }) => (
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

const MAX_CHARS_BEFORE_TRUNCATE = 150;

export default function GoogleReviews() {
  console.log("GoogleReviews: Component file loaded");
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch branches with Google Places configuration
  const { data: branches, isLoading: isBranchesLoading, error: branchesError } = useQuery({
    queryKey: ['branches-with-google-places'],
    queryFn: fetchBranchesWithGooglePlaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to fetch reviews for all branches
  const fetchAllBranchReviews = useCallback(async () => {
    if (!branches || branches.length === 0) {
      console.log("No branches with Google Places configuration found");
      return [];
    }

    console.log(`GoogleReviews: Fetching reviews for ${branches.length} branches... Lang: ${language}`);
    setError(null);
    const allReviews: Review[] = [];
    
    try {
      for (const branch of branches) {
        if (!branch.google_place_id) {
          console.warn(`Skipping branch ${branch.name} due to missing Place ID`);
          continue;
        }

        console.log(`Fetching reviews for branch: ${branch.name} with place ID: ${branch.google_place_id}`);
        const response = await fetchBranchReviews(
          branch.google_place_id,
          language
        );

        if (response.status === 'OK' && response.reviews && response.reviews.length > 0) {
          // Filter for 5-star reviews only
          const branchReviews = response.reviews
            .filter(review => review.rating === 5)
            .map(review => ({
              ...review,
              branch_name: branch.name,
              branch_name_ar: branch.name_ar,
            }));
            
          console.log(`Found ${branchReviews.length} five-star reviews for branch ${branch.name}`);
          allReviews.push(...branchReviews);
        } else {
          console.log(`No 5-star reviews or error for branch ${branch.name}: ${response.error || response.error_message || 'No reviews returned'}`);
        }
      }

      return allReviews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      console.error('Error fetching all branch reviews:', errorMessage);
      setError(errorMessage);
      return [];
    }
  }, [branches, language]);

  // Query for fetching all reviews
  const { 
    data: reviewsData, 
    isLoading: isReviewsLoading,
    error: reviewsError
  } = useQuery({
    queryKey: ['google-reviews', language, branches],
    queryFn: fetchAllBranchReviews,
    enabled: !!branches && branches.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Process and shuffle reviews when data changes
  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      console.log(`Total 5-star reviews fetched: ${reviewsData.length}`);
      // Shuffle the reviews randomly
      const shuffledReviews = [...reviewsData].sort(() => 0.5 - Math.random());
      // Take the top 8
      const randomReviews = shuffledReviews.slice(0, 8);
      setReviews(randomReviews);
    } else if (reviewsData) {
      console.log("No 5-star reviews found across all branches.");
      setReviews([]);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (reviewsError) {
      const errorMessage = reviewsError instanceof Error 
        ? reviewsError.message 
        : 'Unknown error fetching reviews';
      setError(errorMessage);
      console.error('Reviews error:', errorMessage);
    } else if (branchesError) {
      const errorMessage = branchesError instanceof Error 
        ? branchesError.message 
        : 'Unknown error fetching branches';
      setError(errorMessage);
      console.error('Branches error:', errorMessage);
    }
  }, [reviewsError, branchesError]);

  // Debug output for branches and language
  useEffect(() => {
    console.log(`GoogleReviews: useEffect triggered, branches: ${branches?.length} language: ${language}`);
  }, [branches, language]);

  // Component mount debug
  useEffect(() => {
    console.log("GoogleReviews: Component Mounted");
    return () => console.log("GoogleReviews: Component Unmounted");
  }, []);

  console.log(`GoogleReviews: Rendering - Loading: ${isBranchesLoading || isReviewsLoading} Error: ${error} Reviews Count: ${reviews.length}`);

  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const isLoading = isBranchesLoading || isReviewsLoading;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#222222]">
        {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mx-4 px-4">
          {[...Array(4)].map((_, index) => (
            <ReviewSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && <ErrorState error={error} language={language} />}

      {/* Empty State */}
      {!isLoading && !error && reviews.length === 0 && <NoReviews language={language} />}

      {/* Reviews Display */}
      {!isLoading && !error && reviews.length > 0 && (
        <div className="flex overflow-x-auto space-x-4 scroll-smooth py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mx-4 px-4">
          {reviews.map((review, index) => {
            const isLongReview = review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
            return (
              <div className="flex-grow-0 flex-shrink-0 basis-[90%] sm:basis-[45%] md:basis-[31%]" key={`${review.author_name}-${index}-${review.time}`}>
                <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col border border-gray-100">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{review.author_name}</h4>
                      <p className="text-xs text-gray-500">
                        {language === 'ar' ? review.branch_name_ar : review.branch_name}
                      </p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className={`text-gray-600 text-sm leading-relaxed flex-grow ${isLongReview ? 'line-clamp-4' : ''}`}>
                    {review.text}
                  </p>

                  {isLongReview && (
                    <button 
                      onClick={() => handleReadMoreClick(review)}
                      className="text-sm text-[#C4A36F] hover:text-[#A3845A] font-medium mt-2 self-start"
                    >
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read More Modal */}      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.author_name}
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({language === 'ar' ? selectedReview?.branch_name_ar : selectedReview?.branch_name})
              </span>
            </DialogTitle>
             <div className="flex items-center pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
          </DialogHeader>
          <DialogDescription className="mt-4 whitespace-pre-wrap text-gray-700">
            {selectedReview?.text}
          </DialogDescription>
          <Button onClick={() => setIsModalOpen(false)} className="mt-4 w-full sm:w-auto sm:ml-auto">
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
