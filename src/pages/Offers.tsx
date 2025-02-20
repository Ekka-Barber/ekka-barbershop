
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OfferCard } from "@/components/offers/OfferCard";
import { OffersHeader } from "@/components/offers/OffersHeader";
import { useOffers } from "@/hooks/useOffers";
import { useEffect } from 'react';
import { trackViewContent } from "@/utils/tiktokTracking";

const Offers = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { offersFiles, isLoading, error } = useOffers();
  
  useEffect(() => {
    // Track page view after component mounts
    trackViewContent('Offers');
  }, []);

  if (error) {
    console.error('Query error:', error);
  }

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
            <OffersHeader onBackClick={() => navigate('/customer')} />
            
            <div className="space-y-8">
              {isLoading ? (
                <div className="text-center py-8 text-[#222222]">{t('loading.offers')}</div>
              ) : offersFiles && offersFiles.length > 0 ? (
                offersFiles.map((file) => (
                  <OfferCard key={file.id} file={file} />
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
