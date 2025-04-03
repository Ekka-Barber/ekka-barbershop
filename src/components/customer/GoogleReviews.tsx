import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

console.log("GoogleReviews: Component file loaded");

// Interfaces for actual Google Reviews
interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
}

interface Review extends GoogleReview {
  branch_name: string;
  branch_name_ar: string;
}

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
  whatsapp_number: string;
  google_maps_url: string;
  working_hours: Record<string, string[]> | string;
  google_places_api_key: string | null;
  google_place_id: string | null;
}

export default function GoogleReviews() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Read More modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  console.log("GoogleReviews: Component Mounted");

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log("GoogleReviews: Fetching branches...");
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .not('google_places_api_key', 'is', null)
        .not('google_place_id', 'is', null);
      if (error) {
        console.error("GoogleReviews: Branch fetch error", error);
        throw error;
      }
      console.log("GoogleReviews: Branches fetched:", data);
      return data as Branch[];
    }
  });

  // Review fetching logic depends on branches AND language
  useEffect(() => {
    console.log("GoogleReviews: useEffect triggered, branches:", branches, "language:", language);
    const fetchReviews = async () => {
      console.log("GoogleReviews: fetchReviews started");
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        if (!branches || branches.length === 0) {
          console.log("GoogleReviews: No branches configured or data not yet loaded.");
          setIsLoading(false);
          return;
        }

        const allReviews: Review[] = [];
        console.log(`GoogleReviews: Fetching reviews for ${branches.length} branches... Lang: ${language}`);

        for (const branch of branches) {
          if (!branch.google_place_id || !branch.google_places_api_key) {
            console.warn(`GoogleReviews: Skipping branch ${branch.name} due to missing Place ID or API Key.`);
            continue;
          }

          // Add language parameter to the API call
          const apiUrl = `/api/places/reviews?placeId=${encodeURIComponent(branch.google_place_id)}&apiKey=${encodeURIComponent(branch.google_places_api_key)}&language=${language}`;
          console.log(`GoogleReviews: Fetching from API for ${branch.name}: ${apiUrl}`);

          try {
            const response = await fetch(apiUrl);
            console.log(`GoogleReviews: API Response status for branch ${branch.name}:`, response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`GoogleReviews: Error response for branch ${branch.name}:`, errorText);
              continue;
            }

            const data = await response.json();
            console.log(`GoogleReviews: Parsed API Response data for branch ${branch.name}:`, data);

            if (data.status === 'OK' && data.result?.reviews) {
              const branchReviews = data.result.reviews
                .filter((review: GoogleReview) => review.rating === 5)
                .map((review: GoogleReview) => ({
                  ...review,
                  branch_name: branch.name,
                  branch_name_ar: branch.name_ar,
                }));
              console.log(`GoogleReviews: Found ${branchReviews.length} 5-star reviews for branch ${branch.name}`);
              allReviews.push(...branchReviews);
            } else {
              console.warn(`GoogleReviews: No reviews found or API error for branch ${branch.name}. Status: ${data.status}, Message: ${data.error_message || 'No error message'}`);
            }
          } catch (fetchError) {
            console.error(`GoogleReviews: Error fetching/parsing reviews for branch ${branch.name}:`, fetchError);
          }
        }

        console.log(`GoogleReviews: Total 5-star reviews fetched: ${allReviews.length}`);

        if (allReviews.length > 0) {
          // --- Shuffle the reviews randomly ---
          const shuffledReviews = allReviews.sort(() => 0.5 - Math.random());
          // --- Take the top 8 --- 
          const randomReviews = shuffledReviews.slice(0, 8); 
          console.log("GoogleReviews: Setting final 8 random reviews:", randomReviews);
          setReviews(randomReviews);
        } else {
          console.log("GoogleReviews: No 5-star reviews found across all branches.");
          setReviews([]);
        }
      } catch (err) {
        console.error('GoogleReviews: Error in fetchReviews outer catch:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
        setError(errorMessage);
      } finally {
        console.log("GoogleReviews: fetchReviews finished. Setting loading to false.");
        setIsLoading(false);
      }
    };

    if (branches) {
      fetchReviews();
    }
  }, [branches, language]); // Add language as dependency

  console.log("GoogleReviews: Rendering - Loading:", isLoading, "Error:", error, "Reviews Count:", reviews.length);

  const handleReadMoreClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const MAX_CHARS_BEFORE_TRUNCATE = 150; // Adjust as needed

  // Updated Display Reviews UI
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#222222]">
        {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
      </h2>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto space-x-4 scroll-smooth py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mx-4 px-4">
        {reviews.map((review, index) => {
          const isLongReview = review.text.length > MAX_CHARS_BEFORE_TRUNCATE;
          return (
            // Adjusted flex basis for peekaboo effect
            <div className="flex-grow-0 flex-shrink-0 basis-[90%] sm:basis-[45%] md:basis-[31%]" key={`${review.author_name}-${index}-${review.time}`}>
              {/* Review Card Styling */}
              <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col border border-gray-100">
                <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
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

                {/* Review Text with Truncation */}
                <p className={`text-gray-600 text-sm leading-relaxed flex-grow ${isLongReview ? 'line-clamp-4' : ''}`}>
                  {review.text}
                </p>

                {/* Read More Button */}
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
