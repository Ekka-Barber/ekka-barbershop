import { Star, Quote } from 'lucide-react';
import React, { useEffect, useState, useRef, TouchEvent, useCallback, useMemo } from 'react';

import { useViewportWidth } from '@shared/hooks/useViewport';
import { motion, AnimatePresence } from '@shared/lib/motion';
import { cn } from "@shared/lib/utils";
import { Review } from '@shared/services/reviewsService';
import { CachedAvatar } from "@shared/ui/components/cached-avatar";
import { Card, CardContent } from "@shared/ui/components/card";

import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewCarouselProps {
  reviews: Review[];
  onReadMore: (review: Review) => void;
}

// Constants moved outside component to avoid dependency issues
const REVIEWS_PER_PAGE = {
  mobile: 1,    // <640px (sm)
  tablet: 2,    // 640px-1024px (md)
  desktop: 3    // >1024px (lg)
} as const;

/**
 * Creates a balanced array that ensures fair representation of both branches
 * Duplicates reviews from underrepresented branches to achieve balance
 */
function createBalancedReviews<T extends { branch_name_ar?: string | null }>(reviews: T[]): T[] {
  if (!reviews || reviews.length === 0) return [];

  // Separate reviews by branch
  const alWasliyaReviews = reviews.filter(review => review.branch_name_ar === 'الواصلية');
  const ashSharaiReviews = reviews.filter(review => review.branch_name_ar === 'الشرائع');

  // If we don't have both branches or they're already balanced, just shuffle normally
  if (alWasliyaReviews.length === 0 || ashSharaiReviews.length === 0) {
    return shuffleArray(reviews);
  }

  const maxReviews = Math.max(alWasliyaReviews.length, ashSharaiReviews.length);

  // Duplicate the smaller group to match the larger group
  const balancedReviews: T[] = [];

  // Add all reviews from both branches
  balancedReviews.push(...alWasliyaReviews, ...ashSharaiReviews);

  // Duplicate Ash-Sharai reviews to balance representation
  if (ashSharaiReviews.length < maxReviews) {
    const duplicatesNeeded = maxReviews - ashSharaiReviews.length;
    for (let i = 0; i < duplicatesNeeded; i++) {
      const randomIndex = Math.floor(Math.random() * ashSharaiReviews.length);
      balancedReviews.push(ashSharaiReviews[randomIndex]);
    }
  }

  // Duplicate Al-Wasliya reviews if needed (though this is less likely)
  if (alWasliyaReviews.length < maxReviews) {
    const duplicatesNeeded = maxReviews - alWasliyaReviews.length;
    for (let i = 0; i < duplicatesNeeded; i++) {
      const randomIndex = Math.floor(Math.random() * alWasliyaReviews.length);
      balancedReviews.push(alWasliyaReviews[randomIndex]);
    }
  }

  // Final shuffle of the balanced array
  return shuffleArray(balancedReviews);
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const ReviewCarousel = ({
  reviews,
  onReadMore
}: ReviewCarouselProps) => {
  const { language } = useLanguage();
const MAX_CHARS_BEFORE_TRUNCATE = 150;

  const [currentPage, setCurrentPage] = useState(0);
  const viewportWidth = useViewportWidth();
  const getReviewsPerPage = useCallback(() => {
    if (viewportWidth < 640) return REVIEWS_PER_PAGE.mobile;
    if (viewportWidth < 1024) return REVIEWS_PER_PAGE.tablet;
    return REVIEWS_PER_PAGE.desktop;
  }, [viewportWidth]);

  // Refs for touch gesture handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const balancedReviews = useMemo(() => createBalancedReviews(reviews), [reviews]);

  // Calculate total pages based on balanced reviews
  const totalPages = useMemo(() => Math.ceil(balancedReviews.length / getReviewsPerPage()), [balancedReviews.length, getReviewsPerPage]);

  // Touch gesture handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;

    // Detect swipe direction (use lower threshold for mobile)
    const minSwipeDistance = 50;
    if (diffX > minSwipeDistance) {
      // Swiped right (go to previous)
      goToPrevPage();
    } else if (diffX < -minSwipeDistance) {
      // Swiped left (go to next)
      goToNextPage();
    }
touchStartXRef.current = null;
  };

  const reviewsLength = balancedReviews.length;
  const reviewsPerPage = getReviewsPerPage();

  useEffect(() => {
    setCurrentPage(0);
  }, [reviewsLength, language, viewportWidth, reviewsPerPage, totalPages]);

  if (!balancedReviews || balancedReviews.length === 0) {
    return null;
  }

  // Navigate between pages
  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };
  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  // Get current visible reviews from balanced array
  const visibleReviews = () => {
    const startIndex = currentPage * getReviewsPerPage();
    return balancedReviews.slice(startIndex, startIndex + getReviewsPerPage());
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.05
      } 
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 15 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20 
      } 
    }
  };

  const starVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    })
  };

  return (
    <div className="w-full relative" ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Reviews grid with animated transitions */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`page-${currentPage}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3 }}
        >
          {visibleReviews().map((review, index) => {
            const isLongReview = review.text && review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
            return (
              <motion.div
                key={`${review.id ?? review.google_review_time}-${index}`}
                variants={cardVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <Card className="bg-white border border-gray-100 h-full flex flex-col rounded-xl overflow-hidden">
                  <motion.div 
                    className="h-1 bg-brand-gold-400"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, rotate: -10 }}
                        animate={{ opacity: 0.3, rotate: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Quote className="w-5 h-5 text-brand-gold-400/20 mb-2" />
                      </motion.div>
                      
                      <div className={cn("flex items-start mb-2", language === 'ar' ? "space-x-reverse space-x-3" : "space-x-3")}>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <CachedAvatar
                            authorName={review.author_name}
                            className="w-10 h-10 border border-gray-200"
                            size={40}
                          />
                        </motion.div>
                        <div className="flex-1">
                          <motion.h4 
                            className="font-semibold text-gray-800 text-sm"
                            initial={{ opacity: 0, x: language === 'ar' ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            {review.author_name}
                          </motion.h4>
                          <motion.p 
                            className="text-xs text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                          >
                            {language === 'ar' ? review.branch_name_ar : review.branch_name}
                          </motion.p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                custom={i}
                                variants={starVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <motion.p 
                        className={cn("text-gray-600 text-xs leading-relaxed", isLongReview ? "line-clamp-3" : "")}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        "{review.text || (language === 'ar' ? 'مراجعة إيجابية' : 'Positive review')}"
                      </motion.p>
                    </div>

                    {isLongReview && (
                      <motion.div 
                        className="mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <button 
                          onClick={() => onReadMore(review)} 
                          className={cn(
                            "text-xs py-1 px-2 rounded-md bg-brand-gray-200/40 hover:bg-brand-gray-200/50 font-medium inline-flex items-center transition-all",
                            language === 'ar' ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <span className="text-brand-gray-600">
                            {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                          </span>
                          <motion.span 
                            className={cn(
                              "text-brand-gray-600",
                              language === 'ar' ? "mr-1.5 transform rotate-180" : "ml-1.5"
                            )}
                            initial={{ x: 0 }}
                            animate={{ x: language === 'ar' ? -3 : 3 }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatType: "reverse", 
                              duration: 0.8 
                            }}
                          >
                            &rarr;
                          </motion.span>
                        </button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      
      {/* Modern dot indicators - centered and larger for mobile */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-0 my-[9px]">
          {[...Array(totalPages)].map((_, i) => (
            <motion.button 
              key={`page-${i}`} 
              onClick={() => setCurrentPage(i)} 
              className={cn(
                "rounded-full transition-all duration-300 focus:outline-none",
                i === currentPage ? "bg-brand-gold-400" : "bg-brand-gray-200 opacity-70 hover:opacity-100"
              )}
              initial={false}
              animate={{ 
                width: i === currentPage ? 12 : 8,
                height: 8
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`${language === 'ar' ? "الصفحة" : "Page"} ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
