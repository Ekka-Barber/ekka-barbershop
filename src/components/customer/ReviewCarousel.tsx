
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
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
      }}
      className="w-full max-w-5xl mx-auto"
    >
      <CarouselContent>
        {reviews.map((review, index) => {
          const isLongReview = review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
          
          return (
            <CarouselItem 
              key={`${review.author_name}-${index}-${review.time}`}
              className="md:basis-1/2 lg:basis-1/3 pl-4"
            >
              <Card className="bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                    <Avatar className="w-14 h-14 border-2 border-gray-200">
                      <AvatarImage 
                        src={review.profile_photo_url} 
                        alt={review.author_name}
                        className="object-cover"
                      />
                      <AvatarFallback>{review.author_name.charAt(0)}</AvatarFallback>
                    </Avatar>
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

                  <p className={cn("text-gray-600 text-sm leading-relaxed flex-grow", 
                    isLongReview ? "line-clamp-4" : ""
                  )}>
                    {review.text}
                  </p>

                  {isLongReview && (
                    <button 
                      onClick={() => onReadMore(review)}
                      className="text-sm text-[#C4A36F] hover:text-[#A3845A] font-medium mt-2 self-start"
                    >
                      {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                    </button>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center mt-4 space-x-2">
        <CarouselPrevious className="relative static left-0 translate-y-0 h-8 w-8" />
        <CarouselNext className="relative static right-0 translate-y-0 h-8 w-8" />
      </div>
    </Carousel>
  );
};
