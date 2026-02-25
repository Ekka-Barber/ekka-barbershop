import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


import { usePDFFetch } from '@shared/hooks/usePDFFetch';
import { LazyPDFViewer } from '@shared/lib/pdf/LazyPDFViewer';
import { Badge } from "@shared/ui/components/badge";
import { Button } from "@shared/ui/components/button";
import { Card } from "@shared/ui/components/card";
import CountdownTimer from '@shared/ui/components/common/CountdownTimer';
import { MarketingErrorBoundary } from '@shared/ui/components/common/MarketingErrorBoundary';
import AppLayout from '@shared/ui/components/layout/AppLayout';
import { useToast } from "@shared/ui/components/use-toast";

import { useLanguage } from "@/contexts/LanguageContext";


const Offers = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isRouterReady, setIsRouterReady] = useState(false);
  
  useEffect(() => {
    // Mark router as ready after component mounts
    setIsRouterReady(true);
  }, []);
  
  // Use the shared PDF fetch hook with branch information
  const { pdfFiles: offersFiles, isLoading } = usePDFFetch('offers', {
    includeBranchInfo: true,
    language
  });

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

  // Don't render until router context is ready
  if (!isRouterReady) {
    return (
      <AppLayout>
        <div className="w-full flex flex-1 flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="text-center py-8 text-brand-gray-900">{t('loading.offers')}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <MarketingErrorBoundary fallbackType="offers">
        <div className="w-full flex flex-1 flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8 pt-safe w-full">
          <Link to="/customer" className="transition-opacity hover:opacity-80">
            <img
                src="/logo_Header/logo12.svg"
               alt="Ekka Barbershop Logo"
               className="h-24 mb-6 object-contain w-auto"
               loading="eager"
               width="240"
               height="96"
               onError={(event) => {
                 event.currentTarget.onerror = null;
                 event.currentTarget.src =
                   '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp';
               }}
             />
          </Link>
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">{t('special.offers.title')}</h1>
          <div className="h-1 w-24 bg-brand-gold-400 mx-auto mb-6"></div>
          <Button 
            onClick={() => {
              navigate('/customer');
            }}
            className="bg-brand-gray-600 hover:bg-brand-gray-700 text-white transition-all duration-300"
          >
            {t('back.home')}
          </Button>
        </div>
        
        <div className="w-full max-w-2xl space-y-8">
          {isLoading ? (
            <div className="text-center py-8 text-brand-gray-900">{t('loading.offers')}</div>
          ) : offersFiles && offersFiles.length > 0 ? (
            offersFiles!.map((file) => (
              <Card key={file!.id} className="w-full overflow-hidden bg-white shadow-xl rounded-xl border-brand-gold-400/20">
                <div className="p-4 sm:p-6">
                  {file!.branchName && (
                    <div className="mb-4">
                      <Badge 
                        variant="secondary" 
                        className={`
                          text-sm font-medium px-4 py-1.5
                          bg-gradient-to-r from-red-600 to-red-400
                          text-white shadow-sm
                          border-none
                          transition-all duration-300
                          hover:opacity-90
                          ${language === 'ar' ? 'rtl' : 'ltr'}
                        `}
                      >
                        {getBadgeText(file!.branchName)}
                      </Badge>
                    </div>
                  )}
                  <div className="relative">
                    {file!.isExpired && renderExpiredSticker()}
                      {file!.file_type.includes('pdf') ? (
                        <div key={`pdf-${file!.id}`}>
                          <LazyPDFViewer pdfUrl={file!.url} fileName={file!.file_name} />
                        </div>
                      ) : (
                      <div className={`relative ${file!.isExpired ? 'filter grayscale blur-[2px]' : ''}`}>
                        <img
                          src={file!.url}
                          alt={file!.isExpired ? `Expired Offer - ${file!.file_name || 'Special Offer'}` : "Special Offer"}
                          className="w-full max-w-full h-auto rounded-lg transition-all duration-300"
                          onLoad={() => {}}
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                            // Show toast for better user feedback
                            toast({
                              title: 'Failed to load offer image',
                              variant: 'destructive'
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {file!.end_date && !file!.isExpired && (
                    <CountdownTimer endDate={file!.end_date} />
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-brand-gray-900">{t('no.offers')}</div>
          )}
        </div>
      </div>
      </MarketingErrorBoundary>
    </AppLayout>
  );
};

export default Offers;
