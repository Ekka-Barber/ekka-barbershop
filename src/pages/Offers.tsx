
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from '@/components/CountdownTimer';
import { useEffect, useState } from 'react';
import { trackViewContent, trackButtonClick } from "@/utils/tiktokTracking";
import { OptimizedImage } from "@/components/common/OptimizedImage";

const Offers = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
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

        // Validate URL format
        try {
          new URL(publicUrlData.publicUrl);
        } catch (e) {
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
          branchName: language === 'ar' ? file.branch_name_ar : file.branch_name,
          isExpired,
          isWithinThreeDays
        };
      }));
      
      // Filter out null values from failed URL generations
      return filesWithUrls.filter(Boolean).sort((a, b) => {
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
    console.error('Query error:', fetchError);
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

  // Define constant paths to prevent typos
  const logoPath = "/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png";

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({...prev, [id]: true}));
    toast.error('Failed to load offer image');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="sticky top-0 z-50 bg-gradient-to-b from-gray-50 to-transparent h-11">
            <div className="max-w-md mx-auto h-full relative">
              <div className="absolute right-0 top-0 h-full" style={{ direction: 'ltr' }}>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          
          <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            <div className="flex flex-col items-center mb-8">
              <Link to="/customer" className="transition-opacity hover:opacity-80">
                <OptimizedImage 
                  src={logoPath}
                  fallbackSrc={logoPath}
                  alt="Ekka Barbershop Logo" 
                  className="h-24 mb-6 object-contain cursor-pointer"
                  width={96}
                  height={96}
                  priority={true}
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
                offersFiles.map((file) => (
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
                          <PDFViewer pdfUrl={file.url} />
                        ) : (
                          <div className={`relative ${file.isExpired ? 'filter grayscale blur-[2px]' : ''}`}>
                            {!imageErrors[file.id] && (
                              <OptimizedImage 
                                src={file.url} 
                                alt={file.isExpired ? `Expired Offer - ${file.file_name || 'Special Offer'}` : "Special Offer"}
                                className="w-full max-w-full h-auto rounded-lg transition-all duration-300"
                                width={800}
                                height={500}
                                loading="lazy"
                                onLoad={() => console.log('Image loaded successfully:', file.url)}
                                onError={() => {
                                  console.error('Image failed to load:', file.url);
                                  console.error('Image error details:', {
                                    fileName: file.file_name,
                                    filePath: file.file_path,
                                    fileType: file.file_type,
                                    generatedUrl: file.url
                                  });
                                  handleImageError(file.id);
                                }}
                              />
                            )}
                            {imageErrors[file.id] && (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                <div className="text-gray-500 text-center">
                                  <p className="mb-2">{t('image.failed.to.load')}</p>
                                  <p className="text-sm">{file.file_name || 'Special Offer'}</p>
                                </div>
                              </div>
                            )}
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
        </div>
      </div>
      <footer className="page-footer" />
    </div>
  );
};

export default Offers;
