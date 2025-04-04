
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBranchesWithGooglePlaces, fetchBranchReviews, GoogleReview } from '@/services/googlePlacesService';
import { logger } from '@/utils/logger';
import { Language } from '@/types/language';

// Interface for a review with branch information
export interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string;
}

export const useReviews = (language: Language) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const allReviewsPool = useRef<Review[]>([]);
  
  // Set a higher stale time for better caching (30 minutes)
  const CACHE_STALE_TIME = 30 * 60 * 1000;

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
          // Get only 5-star reviews (changed from 4+ to exactly 5)
          const branchReviews = response.reviews
            .filter(review => review.rating === 5)
            .map(review => ({
              ...review,
              branch_name: branch.name,
              branch_name_ar: branch.name_ar
            }));
            
          logger.debug(`Found ${branchReviews.length} 5-star reviews for branch ${branch.name}`);
          allReviews.push(...branchReviews);
        } else {
          logger.debug(`No 5-star reviews or error for branch ${branch.name}: ${response.error || response.error_message || 'No reviews returned'}`);
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
      logger.debug(`Total 5-star reviews fetched: ${reviewsData.length}`);
      
      // Store all reviews in our pool
      allReviewsPool.current = reviewsData;
      
      // Make sure we display at least all available reviews up to 15
      const reviewsToDisplay = Math.min(15, reviewsData.length);
      const randomSelection = getRandomReviews(reviewsData, reviewsToDisplay);
      
      logger.debug(`Displaying ${randomSelection.length} reviews out of ${reviewsData.length} available`);
      setReviews(randomSelection);
      setDisplayedReviews(randomSelection);
    } else if (reviewsData) {
      logger.debug("No 5-star reviews found across all branches.");
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

  return {
    displayedReviews,
    isLoading: isBranchesLoading || isReviewsLoading,
    error
  };
};
