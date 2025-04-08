import React, { useEffect, useState, useRef, TouchEvent } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Review } from './hooks/useReviews';
import { logger } from '@/utils/logger';
interface ReviewCarouselProps {
  reviews: Review[];
  onReadMore: (review: Review) => void;
}
export const ReviewCarousel = ({
  reviews,
  onReadMore
}: ReviewCarouselProps) => {
  const {
    language
  } = useLanguage();
  const MAX_CHARS_BEFORE_TRUNCATE = 150;

  // Track visible reviews
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = {
    mobile: 1,
    // <640px (sm)
    tablet: 2,
    // 640px-1024px (md)
    desktop: 3 // >1024px (lg)
  };

  // Get viewport width to determine how many reviews to show
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const getReviewsPerPage = () => {
    if (viewportWidth < 640) return reviewsPerPage.mobile;
    if (viewportWidth < 1024) return reviewsPerPage.tablet;
    return reviewsPerPage.desktop;
  };

  // Refs for touch gesture handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

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

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / getReviewsPerPage());

  // Debug log the reviews being passed to the carousel
  useEffect(() => {
    logger.debug(`ReviewCarousel received ${reviews.length} reviews to render in ${language} mode`);
    logger.debug(`Viewport width: ${viewportWidth}px, showing ${getReviewsPerPage()} reviews per page`);
    logger.debug(`Total pages: ${totalPages}`);
    setCurrentPage(0); // Reset to first page on language change
  }, [reviews, language, viewportWidth]);
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
  return <div className="w-full relative" ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Reviews grid with animated transitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-300">
        {visibleReviews().map((review, index) => {
        const isLongReview = review.text && review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
        return <Card key={`${review.author_name}-${index}-${review.time}`} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col rounded-xl overflow-hidden animate-fadeIn">
              <div className="h-1 bg-[#C4A36F]"></div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Quote className="w-5 h-5 text-[#C4A36F]/20 mb-2" />
                  
                  <div className={cn("flex items-start mb-2", language === 'ar' ? "space-x-reverse space-x-3" : "space-x-3")}>
                    <Avatar className="w-10 h-10 border border-gray-200">
                      <AvatarImage src={review.profile_photo_url} alt={review.author_name} className="object-cover" />
                      <AvatarFallback className="bg-[#C4A36F]/10 text-[#C4A36F] text-xs">{review.author_name ? review.author_name.charAt(0) : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{review.author_name}</h4>
                      <p className="text-xs text-gray-500">
                        {language === 'ar' ? review.branch_name_ar : review.branch_name}
                      </p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                      </div>
                    </div>
                  </div>
                  
                  <p className={cn("text-gray-600 text-xs leading-relaxed", isLongReview ? "line-clamp-3" : "")}>
                    "{review.text || (language === 'ar' ? 'مراجعة إيجابية' : 'Positive review')}"
                  </p>
                </div>

                {isLongReview && <div className="mt-2">
                    <button onClick={() => onReadMore(review)} className="text-xs text-[#C4A36F] hover:text-[#A3845A] font-medium inline-flex items-center">
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read More'} 
                      <span className={cn(language === 'ar' ? "mr-1 ml-0 transform rotate-180" : "ml-1")}>&rarr;</span>
                    </button>
                  </div>}
              </CardContent>
            </Card>;
      })}
      </div>
      
      {/* Modern dot indicators - centered and larger for mobile */}
      {totalPages > 1 && <div className="flex justify-center items-center gap-2 mb-0 my-[9px]">
          {[...Array(totalPages)].map((_, i) => <button key={`page-${i}`} onClick={() => setCurrentPage(i)} className={cn("w-2 h-2 rounded-full transition-all duration-300 focus:outline-none", i === currentPage ? "bg-[#C4A36F] w-3" // Active dot is larger
      : "bg-gray-300 opacity-70 hover:opacity-100")} aria-label={`${language === 'ar' ? "الصفحة" : "Page"} ${i + 1}`} />)}
        </div>}
    </div>;
};