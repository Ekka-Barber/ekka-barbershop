
import { useState, useEffect } from 'react';
import { Language } from '@/types/language';

export interface Review {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export const useReviews = (language: Language) => {
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the Ekka place ID and API key
      const placeId = 'ChIJLYIU57Qx6hURhgCtpkWYv2o'; // Al-Waslyia branch place ID
      const apiKey = 'AIzaSyAuSzcXL6Qpel1SYDjo7OfF1BimYKevtbU';
      
      console.log(`Fetching reviews with language: ${language}`);
      
      const response = await fetch(`/api/places/reviews?placeId=${placeId}&apiKey=${apiKey}&language=${language}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received reviews data:`, data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const reviews = data.reviews || [];
      console.log(`Parsed ${reviews.length} reviews for language ${language}`);
      
      setDisplayedReviews(reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching reviews'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const refetch = async () => {
    await fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
  }, [language]);

  return { displayedReviews, isLoading, error, refetch };
};
