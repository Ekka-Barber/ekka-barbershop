import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesWithGooglePlaces, fetchBranchReviews, GoogleReview } from '@/services/googlePlacesService';
import { Language } from '@/types/language';

// Interface for a review with branch information
export interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string | null;
}

export const useReviews = (language: Language) => {
  const [error, setError] = useState<string | null>(null);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const allReviewsPool = useRef<Review[]>([]);
  
  // Set cache time to 10 minutes as requested
  const CACHE_STALE_TIME = 10 * 60 * 1000;

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
      return [];
    }

    setError(null);
    const allReviews: Review[] = [];

    try {
      for (const branch of branches) {
        if (!branch.google_place_id) {
          continue;
        }

        // Make sure we pass the language parameter correctly
        const response = await fetchBranchReviews(branch.google_place_id, language);

        if (response.status === 'OK' && response.reviews && response.reviews.length > 0) {
          // Get 5-star reviews and add branch information
          const branchReviews = response.reviews
            .filter(review => review.rating === 5)
            .map(review => ({
              ...review,
              branch_name: branch.name,
              branch_name_ar: branch.name_ar
            }));

          allReviews.push(...branchReviews);
        }
      }

      // If we don't have enough reviews in the current language (less than 3), keep the existing pool
      if (allReviews.length < 3 && allReviewsPool.current.length > 0) {
        return allReviewsPool.current;
      }

      return allReviews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      return [];
    }
  }, [branches, language]);

  // Query for fetching all reviews with updated cache time (10 minutes)
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    error: reviewsError,
    refetch
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
      // Store all reviews in our pool
      allReviewsPool.current = reviewsData;

      // Make sure we display at least all available reviews up to 15
      const reviewsToDisplay = Math.min(15, reviewsData.length);
      const randomSelection = getRandomReviews(reviewsData, reviewsToDisplay);

      setDisplayedReviews(randomSelection);
    } else if (reviewsData) {
      setDisplayedReviews([]);
    }
  }, [reviewsData, getRandomReviews, language]);
  
  useEffect(() => {
    if (reviewsError) {
      const errorMessage = reviewsError instanceof Error ? reviewsError.message : 'Unknown error fetching reviews';
      setError(errorMessage);
    } else if (branchesError) {
      const errorMessage = branchesError instanceof Error ? branchesError.message : 'Unknown error fetching branches';
      setError(errorMessage);
    }
  }, [reviewsError, branchesError]);

  return {
    displayedReviews,
    isLoading: isBranchesLoading || isReviewsLoading,
    error,
    refetch
  };
};
