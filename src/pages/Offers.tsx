import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/services/supabaseService';
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from '@/components/CountdownTimer';
import { useEffect, lazy, Suspense } from 'react';
import { trackViewContent, trackButtonClick } from "@/utils/tiktokTracking";
import AppLayout from '@/components/layout/AppLayout';

// Lazy load PDFViewer for better bundle optimization
const PDFViewer = lazy(() => import('@/components/PDFViewer'));

// Loading component for PDFViewer
const PDFViewerLoader = () => (
  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-12 h-12 border-4 border-[#C4A36F] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#222222] font-medium">Loading PDF viewer...</p>
    </div>
  </div>
);


const Offers = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Track page view after component mounts
    trackViewContent({
      pageId: 'offers',
      pageName: 'Offers'
    });
  }, []);
  
  const { data: offersFiles, isLoading, error: fetchError } = useQuery({
    queryKey: ['active-offers', language],
    queryFn: async () => {
      console.log('Fetching offers...');

      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('marketing_files')
        .select(`
          *,
          branch:branch_id (
            id,
            name,
            name_ar
          )
        `)
        .eq('category', 'offers')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching offers:', error);
        toast.error(t('error.loading.offers'));
        throw error;
      }

      console.log('Offers query result:', { data, error, dataLength: data?.length || 0 });

      if (!data || data.length === 0) {
        console.log('No offers found in the database');
        return [];
      }
      
      const filesWithUrls = await Promise.all(data.map(async (file: any) => {
        console.log('Processing file:', file);
        const { data: publicUrlData } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(file.file_path);
        
        // Log URL generation details
        console.log('Generated URL for file:', {
          fileName: file.file_name,
          filePath: file.file_path,
          generatedUrl: publicUrlData?.publicUrl
        });

        // Verify URL is valid
        if (!publicUrlData?.publicUrl) {
          console.error('Failed to get public URL for file:', file.file_path);
          return null;
        }

        console.log('File processing successful:', {
          id: file.id,
          fileName: file.file_name,
          url: publicUrlData.publicUrl,
          branchName: language === 'ar' ? file.branch?.name_ar : file.branch?.name
        });

        // Validate URL format
        try {
          new URL(publicUrlData.publicUrl);
        } catch {
          console.error('Invalid URL generated:', publicUrlData.publicUrl);
          return null;
        }

        const now = new Date().getTime();
        const endDate = file.end_date ? new Date(file.end_date).getTime() : null;
        const isExpired = endDate ? endDate < now : false;
        const isWithinThreeDays = endDate ? 
          (now - endDate) < (3 * 24 * 60 * 60 * 1000) : false;
        
        if (!isExpired) {
          trackViewContent({
            pageId: `offer_${file.id}`,
            pageName: 'Offer'
          });
        }
        
        return {
          ...file,
          url: publicUrlData.publicUrl,
          branchName: language === 'ar' ? file.branch?.name_ar : file.branch?.name,
          isExpired,
          isWithinThreeDays
        };
      }));
      
      // Filter out null values from failed URL generations
      return filesWithUrls.filter(Boolean).sort((a: any, b: any) => {
        if (a.isExpired !== b.isExpired) {
          return a.isExpired ? 1 : -1;
        }
        return (a.display_order || 0) - (b.display_order || 0);
      });
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (fetchError) {
    // Error handling is done through the UI, no need for console.error
  }

  const getBadgeText = (branchName: string | null) => {
    if (!branchName) return '';
    
    if (language === 'ar') {
      return `فرع ${branchName} فقط`;
    } else {
      return `On ${branchName} only`;
    }
  };

  const renderExpiredSticker = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg transform rotate-[-15deg] shadow-xl text-center">
        <div className="text-2xl font-bold mb-1">ENDED</div>
        <div className="text-xl font-bold">انتهى</div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="w-full flex flex-1 flex-col items-center justify-center max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8 pt-safe w-full">
          <Link to="/customer" className="transition-opacity hover:opacity-80">
            <img 
              src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png"
              alt="Ekka Barbershop Logo" 
              className="h-24 mb-6 object-contain w-auto"
              loading="eager"
              width="240"
              height="96"
            />
          </Link>
          <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('special.offers.title')}</h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
          <Button 
            onClick={() => {
              trackButtonClick({
                buttonId: 'back_home',
                buttonName: 'Back Home'
              });
              navigate('/customer');
            }}
            className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300"
          >
            {t('back.home')}
          </Button>
        </div>
        
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-8 text-[#222222]">{t('loading.offers')}</div>
          ) : offersFiles && offersFiles.length > 0 ? (
            offersFiles.map((file: any) => (
              <Card key={file.id} className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20">
                <div className="p-6">
                  {file.branchName && (
                    <div className="mb-4">
                      <Badge 
                        variant="secondary" 
                        className={`
                          text-sm font-medium px-4 py-1.5 
                          bg-gradient-to-r from-red-600 to-red-400 
                          text-white shadow-sm 
                          border-none
                          transition-all duration-300 
                          animate-flash
                          hover:opacity-90
                          ${language === 'ar' ? 'rtl' : 'ltr'}
                        `}
                      >
                        {getBadgeText(file.branchName)}
                      </Badge>
                    </div>
                  )}
                  <div className="relative">
                    {file.isExpired && renderExpiredSticker()}
                    {file.file_type.includes('pdf') ? (
                      <Suspense fallback={<PDFViewerLoader />}>
                        <PDFViewer pdfUrl={file.url} />
                      </Suspense>
                    ) : (
                      <div className={`relative ${file.isExpired ? 'filter grayscale blur-[2px]' : ''}`}>
                        <img 
                          src={file.url} 
                          alt={file.isExpired ? `Expired Offer - ${file.file_name || 'Special Offer'}` : "Special Offer"}
                          className="w-full max-w-full h-auto rounded-lg transition-all duration-300"
                          onLoad={() => console.log('Image loaded successfully:', file.url)}
                          onError={(e) => {
                            console.error('Image failed to load:', file.url);
                            // Log detailed error information
                            console.error('Image error details:', {
                              fileName: file.file_name,
                              filePath: file.file_path,
                              fileType: file.file_type,
                              generatedUrl: file.url
                            });
                            e.currentTarget.src = '/placeholder.svg';
                            // Show toast for better user feedback
                            toast.error('Failed to load offer image');
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {file.end_date && !file.isExpired && (
                    <CountdownTimer endDate={file.end_date} />
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-[#222222]">{t('no.offers')}</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Offers;
