
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const BookingContainer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
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

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="bg-gradient-to-b from-gray-50 to-transparent h-11">
        <div className="max-w-md mx-auto h-full relative">
          {/* Force the language switcher to stay in the right corner regardless of dir attribute */}
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
  );
};
