import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReviewsFromDatabase, Review } from '@/services/reviewsService';
import { Language } from '@/types/language';

export const useReviews = (language: Language) => {
  const [error, setError] = useState<string | null>(null);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [hasReviewsInOtherLanguages, setHasReviewsInOtherLanguages] = useState(false);
  const allReviewsPool = useRef<Review[]>([]);

  // Cache time - reviews are stored in DB, so we can cache longer
  const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes

  // Fetch reviews from database filtered by language
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    error: reviewsError,
    refetch
  } = useQuery({
    queryKey: ['google-reviews', language],
    queryFn: () => fetchReviewsFromDatabase(language),
    staleTime: CACHE_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Fetch all reviews to check if there are reviews in other languages
  const {
    data: allReviewsData,
  } = useQuery({
    queryKey: ['google-reviews-all'],
    queryFn: async () => {
      const arabicReviews = await fetchReviewsFromDatabase('ar');
      const englishReviews = await fetchReviewsFromDatabase('en');
      return { arabic: arabicReviews, english: englishReviews };
    },
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

  // Check for reviews in other languages
  useEffect(() => {
    if (allReviewsData) {
      const hasArabicReviews = allReviewsData.arabic && allReviewsData.arabic.length > 0;
      const hasEnglishReviews = allReviewsData.english && allReviewsData.english.length > 0;

      if (language === 'ar') {
        setHasReviewsInOtherLanguages(hasEnglishReviews);
      } else {
        setHasReviewsInOtherLanguages(hasArabicReviews);
      }
    }
  }, [allReviewsData, language]);

  // Process and randomize reviews when data changes
  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      // Store all reviews in our pool
      allReviewsPool.current = reviewsData;

      // Randomize and display up to 15 reviews
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
    }
  }, [reviewsError]);

  return {
    displayedReviews,
    isLoading: isReviewsLoading,
    error,
    refetch,
    hasReviewsInOtherLanguages
  };
};
