
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackViewContent } from "@/utils/tiktokTracking";
import { useIsMobile } from '@/hooks/use-mobile';

export const useOffers = () => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  const { data: offersFiles, isLoading, error } = useQuery({
    queryKey: ['active-offers', language],
    queryFn: async () => {
      console.log('Fetching offers...');
      
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*, branches(name, name_ar)')
        .eq('category', 'offers')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching offers:', error);
        toast.error(t('error.loading.offers'));
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No offers found in the database');
        return [];
      }
      
      const filesWithUrls = await Promise.all(data.map(async (file) => {
        console.log('Processing file:', file);
        
        // For PDFs, always use the original file
        if (file.file_type.includes('pdf')) {
          const { data: fileUrl } = supabase.storage
            .from('marketing_files')
            .getPublicUrl(file.original_path);
          
          console.log('Generated PDF URL:', fileUrl.publicUrl);
          return {
            ...file,
            url: fileUrl.publicUrl,
            originalUrl: fileUrl.publicUrl,
            branchName: language === 'ar' ? file.branches?.name_ar : file.branches?.name,
            isExpired: isOfferExpired(file.end_date),
            isWithinThreeDays: isWithinThreeDays(file.end_date)
          };
        }
        
        // For images, get both optimized and original URLs
        const { data: optimizedUrl } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(`optimized/${file.file_name}`);
        
        const { data: originalUrl } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(`original/${file.file_name}`);
        
        console.log('Generated URLs:', {
          optimized: optimizedUrl.publicUrl,
          original: originalUrl.publicUrl
        });
        
        // Use optimized version for mobile and regular display
        const displayUrl = isMobile ? optimizedUrl.publicUrl : originalUrl.publicUrl;
        
        return {
          ...file,
          url: displayUrl,
          originalUrl: originalUrl.publicUrl,
          optimizedUrl: optimizedUrl.publicUrl,
          branchName: language === 'ar' ? file.branches?.name_ar : file.branches?.name,
          isExpired: isOfferExpired(file.end_date),
          isWithinThreeDays: isWithinThreeDays(file.end_date)
        };
      }));
      
      // Filter out any null entries and sort
      return filesWithUrls
        .filter(Boolean)
        .sort((a, b) => {
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }
          return (a.display_order || 0) - (b.display_order || 0);
        });
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper functions
  const isOfferExpired = (endDate: string | null): boolean => {
    if (!endDate) return false;
    return new Date(endDate).getTime() < new Date().getTime();
  };

  const isWithinThreeDays = (endDate: string | null): boolean => {
    if (!endDate) return false;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const timeUntilEnd = new Date(endDate).getTime() - new Date().getTime();
    return timeUntilEnd > 0 && timeUntilEnd < threeDaysMs;
  };

  return {
    offersFiles,
    isLoading,
    error
  };
};
