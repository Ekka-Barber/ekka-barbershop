
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Branch } from "@/types/booking";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Loader2 } from "lucide-react";

export const BookingContainer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const { data: branch, isLoading: branchLoading, error: branchError } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Branch;
    },
    enabled: !!branchId,
    retry: 2,
    retryDelay: 1000,
  });

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('select.branch')}
          </h1>
          <Button 
            className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/customer')}
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            {language === 'ar' ? 'عذراً! حدث خطأ ما' : 'Error Loading Branch'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'لم نتمكن من تحميل معلومات الفرع. يرجى المحاولة مرة أخرى.'
              : 'We could not load the branch information. Please try again.'}
          </p>
          <Button 
            onClick={() => navigate('/customer')}
            variant="outline"
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    );
  }

  if (branchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4A36F]" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="bg-gradient-to-b from-gray-50 to-transparent h-11">
          <div className="max-w-md mx-auto h-full relative">
            <div className="absolute right-0 top-0 h-full" style={{ direction: 'ltr' }}>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="flex-grow max-w-md mx-auto w-full pt-8 px-4 sm:px-6 lg:px-8">
          <BookingHeader
            branchName={language === 'ar' ? branch?.name_ar : branch?.name}
            branchAddress={language === 'ar' ? branch?.address_ar : branch?.address}
            isLoading={branchLoading}
          />
          <BookingSteps branch={branch} />
        </div>
      </div>
    </ErrorBoundary>
  );
};
