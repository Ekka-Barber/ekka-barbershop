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
import { Card } from "@/components/ui/card";
import { BookingProvider } from "@/contexts/BookingContext";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { NoBranchSelected } from "@/components/booking/NoBranchSelected";

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
      <div className="min-h-screen flex flex-col">
        <div className="app-header">
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="content-area flex flex-col items-center justify-center">
            <div className="text-center w-full max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {t('select.branch')}
              </h1>
              <Button 
                className="touch-target bg-[#C4A36F] hover:bg-[#B39260] text-white shadow-md hover:shadow-lg"
                onClick={() => navigate('/customer')}
              >
                {t('go.back')}
              </Button>
            </div>
          </div>
        </div>
        <footer className="page-footer" />
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="app-header">
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="content-area flex flex-col items-center justify-center">
            <div className="text-center w-full max-w-2xl mx-auto space-y-4">
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
                className="touch-target"
              >
                {t('go.back')}
              </Button>
            </div>
          </div>
        </div>
        <footer className="page-footer" />
      </div>
    );
  }

  if (branchLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="app-header">
          <div className="language-switcher-container">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          <div className="content-area flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#C4A36F]" />
          </div>
        </div>
        <footer className="page-footer" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <BookingHeader branch={branch} isLoading={branchLoading} onBranchSelect={handleBranchSelect} />
        
        {isLoading && <SkeletonLoader />}
        
        {!isLoading && branch && (
          <BookingProvider branch={branch}>
            <BookingSteps branch={branch} />
          </BookingProvider>
        )}
        
        {!isLoading && !branch && <NoBranchSelected />}
      </div>
    </ErrorBoundary>
  );
};
