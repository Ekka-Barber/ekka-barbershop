import type { TouchEvent} from 'react';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Review } from './hooks/useReviews';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';

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

export const ReviewCarousel = ({
  reviews,
  onReadMore
}: ReviewCarouselProps) => {
  const { language } = useLanguage();
  const MAX_CHARS_BEFORE_TRUNCATE = 150;

  // Track visible reviews
  const [currentPage, setCurrentPage] = useState(0);

  // Get viewport width to determine how many reviews to show
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const getReviewsPerPage = useCallback(() => {
    if (viewportWidth < 640) return REVIEWS_PER_PAGE.mobile;
    if (viewportWidth < 1024) return REVIEWS_PER_PAGE.tablet;
    return REVIEWS_PER_PAGE.desktop;
  }, [viewportWidth]);

  // Refs for touch gesture handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(reviews.length / getReviewsPerPage()), [reviews.length, getReviewsPerPage]);

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

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug log the reviews being passed to the carousel
  useEffect(() => {
    logger.debug(`ReviewCarousel received ${reviews.length} reviews to render in ${language} mode`);
    logger.debug(`Viewport width: ${viewportWidth}px, showing ${getReviewsPerPage()} reviews per page`);
    logger.debug(`Total pages: ${totalPages}`);
    setCurrentPage(0); // Reset to first page on language change
  }, [reviews, language, viewportWidth, getReviewsPerPage, totalPages]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Navigate between pages
  const goToNextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };
  const goToPrevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  // Get current visible reviews
  const visibleReviews = () => {
    const startIndex = currentPage * getReviewsPerPage();
    return reviews.slice(startIndex, startIndex + getReviewsPerPage());
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
                key={`${review.author_name}-${index}-${review.time}`}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="bg-white border border-gray-100 h-full flex flex-col rounded-xl overflow-hidden">
                  <motion.div 
                    className="h-1 bg-[#C4A36F]"
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
                        <Quote className="w-5 h-5 text-[#C4A36F]/20 mb-2" />
                      </motion.div>
                      
                      <div className={cn("flex items-start mb-2", language === 'ar' ? "space-x-reverse space-x-3" : "space-x-3")}>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Avatar className="w-10 h-10 border border-gray-200">
                            <AvatarImage src={review.profile_photo_url} alt={review.author_name} className="object-cover" />
                            <AvatarFallback className="bg-[#C4A36F]/10 text-[#C4A36F] text-xs">
                              {review.author_name ? review.author_name.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
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
                            "text-xs py-1 px-2 rounded-md bg-[#4c4c4c]/10 hover:bg-[#4c4c4c]/15 font-medium inline-flex items-center transition-all",
                            language === 'ar' ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <span className="text-[#4c4c4c]">
                            {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                          </span>
                          <motion.span 
                            className={cn(
                              "text-[#4c4c4c]",
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
                i === currentPage ? "bg-[#C4A36F]" : "bg-gray-300 opacity-70 hover:opacity-100"
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
