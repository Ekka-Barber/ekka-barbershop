
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackViewContent } from "@/utils/tiktokTracking";

export const useOffers = () => {
  const { t, language } = useLanguage();

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
        const filePath = file.original_path || file.file_path;
        const { data: fileUrl } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(filePath);
        
        const now = new Date().getTime();
        const endDate = file.end_date ? new Date(file.end_date).getTime() : null;
        const isExpired = endDate ? endDate < now : false;
        const isWithinThreeDays = endDate ? 
          (endDate - now) < (3 * 24 * 60 * 60 * 1000) : false;
        
        return { 
          ...file, 
          url: fileUrl.publicUrl,
          branchName: language === 'ar' ? file.branch_name_ar : file.branch_name,
          isExpired,
          isWithinThreeDays
        };
      }));
      
      return filesWithUrls.sort((a, b) => {
        if (a.isExpired !== b.isExpired) {
          return a.isExpired ? 1 : -1;
        }
        return (a.display_order || 0) - (b.display_order || 0);
      });
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    offersFiles,
    isLoading,
    error
  };
};
