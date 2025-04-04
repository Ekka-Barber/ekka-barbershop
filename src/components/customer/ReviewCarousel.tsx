
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { GoogleReview } from '@/services/googlePlacesService';

interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string;
}

interface ReviewCarouselProps {
  reviews: Review[];
  onReadMore: (review: Review) => void;
}

export const ReviewCarousel = ({ reviews, onReadMore }: ReviewCarouselProps) => {
  const { language } = useLanguage();
  const MAX_CHARS_BEFORE_TRUNCATE = 150;

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        dragFree: true,
      }}
      className="w-full relative -mx-4 px-4"
    >
      <CarouselContent className="-ml-4">
        {reviews.map((review, index) => {
          const isLongReview = review.text && review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
          const rating = review.rating || 5;
          
          return (
            <CarouselItem 
              key={`${review.author_name}-${index}-${review.time}`}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col rounded-xl overflow-hidden">
                <div className="h-1.5 bg-[#C4A36F]"></div>
                <CardContent className="p-6 flex-1">
                  <Quote className="w-8 h-8 text-[#C4A36F]/20 mb-2" />
                  
                  <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                    <Avatar className="w-14 h-14 border-2 border-gray-200">
                      <AvatarImage 
                        src={review.profile_photo_url} 
                        alt={review.author_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#C4A36F]/10 text-[#C4A36F]">{review.author_name ? review.author_name.charAt(0) : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{review.author_name}</h4>
                      <p className="text-xs text-gray-500">
                        {language === 'ar' ? review.branch_name_ar : review.branch_name}
                      </p>
                      <div className="flex items-center mt-1">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {[...Array(5 - rating)].map((_, i) => (
                          <Star key={i + rating} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className={cn("text-gray-600 text-sm leading-relaxed mb-4", 
                    isLongReview ? "line-clamp-4" : ""
                  )}>
                    "{review.text || (language === 'ar' ? 'مراجعة إيجابية' : 'Positive review')}"
                  </p>

                  {isLongReview && (
                    <button 
                      onClick={() => onReadMore(review)}
                      className="text-sm text-[#C4A36F] hover:text-[#A3845A] font-medium mt-auto inline-flex items-center"
                    >
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read More'} 
                      <span className="ml-1 rtl:mr-1 rtl:ml-0">&rarr;</span>
                    </button>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};
