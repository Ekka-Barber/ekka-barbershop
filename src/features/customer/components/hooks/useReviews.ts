import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { fetchReviewsFromDatabase, Review } from '@shared/services/reviewsService';
import { Language } from '@shared/types/language';

export type { Review };

const CACHE_STALE_TIME = 5 * 60 * 1000;

const getRandomReviews = (pool: Review[], count: number): Review[] => {
  if (pool.length <= count) return [...pool];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

export const useReviews = (language: Language) => {
  useRealtimeSubscription({
    table: 'google_reviews',
    queryKeys: [['google-reviews', language], ['google-reviews-all']],
  });

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    error: reviewsError,
    refetch,
  } = useQuery({
    queryKey: ['google-reviews', language],
    queryFn: () => fetchReviewsFromDatabase(language),
    staleTime: CACHE_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const shouldFetchAllReviews = useMemo(() => !reviewsData || reviewsData.length === 0, [reviewsData]);

  const { data: allReviewsData } = useQuery({
    queryKey: ['google-reviews-all'],
    queryFn: async () => {
      const [arabicReviews, englishReviews] = await Promise.all([
        fetchReviewsFromDatabase('ar'),
        fetchReviewsFromDatabase('en'),
      ]);
      return { arabic: arabicReviews, english: englishReviews };
    },
    staleTime: CACHE_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: shouldFetchAllReviews,
  });

  const displayedReviews = useMemo(() => {
    if (!reviewsData || reviewsData.length === 0) return [];
    const reviewsToDisplay = Math.min(15, reviewsData.length);
    return getRandomReviews(reviewsData, reviewsToDisplay);
  }, [reviewsData]);

  const hasReviewsInOtherLanguages = useMemo(() => {
    if (reviewsData && reviewsData.length > 0) return false;
    if (!allReviewsData) return false;
    const hasArabicReviews = allReviewsData.arabic && allReviewsData.arabic.length > 0;
    const hasEnglishReviews = allReviewsData.english && allReviewsData.english.length > 0;
    return language === 'ar' ? hasEnglishReviews : hasArabicReviews;
  }, [reviewsData, allReviewsData, language]);

  const error = useMemo(() => {
    if (!reviewsError) return null;
    return reviewsError instanceof Error ? reviewsError.message : 'Unknown error fetching reviews';
  }, [reviewsError]);

  return {
    displayedReviews,
    isLoading: isReviewsLoading,
    error,
    refetch,
    hasReviewsInOtherLanguages,
  };
};
