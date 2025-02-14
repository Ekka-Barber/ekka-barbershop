import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";

const Customer = () => {
  const navigate = useNavigate();
  const {
    t,
    language
  } = useLanguage();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const {
    data: branches
  } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('branches').select('*');
      if (error) throw error;
      return data;
    }
  });
  const handleBranchSelect = (branchId: string) => {
    setBranchDialogOpen(false);
    navigate(`/bookings?branch=${branchId}`);
  };
  const handleLocationClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };
  return <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="app-container">
        <div className="content-area">
          <div className="text-center mb-8">
            <img src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png" alt="Ekka Barbershop Logo" className="h-32 mx-auto mb-6" />
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-[#222222]">
                {t('welcome.line1')}
              </h2>
              <h1 className="text-3xl font-bold text-[#222222]">
                {t('welcome.line2')}
              </h1>
            </div>
            <div className="h-1 w-24 bg-[#C4A36F] mx-auto mt-4"></div>
          </div>

          <div className="space-y-4 max-w-xs mx-auto">
            <Button className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" onClick={() => navigate('/menu')}>
              {t('view.menu')}
            </Button>
            
            <Button className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" onClick={() => navigate('/offers')}>
              {t('special.offers')}
            </Button>

            <Button className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" onClick={() => setBranchDialogOpen(true)}>
              {t('book.now')}
            </Button>

            <Button className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" onClick={() => setLocationDialogOpen(true)}>
              <div className={`w-full flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
                <MapPin className="h-5 w-5" />
                <span>{language === 'ar' ? 'فروعنا' : 'Our Branches'}</span>
              </div>
            </Button>

            <Button className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 touch-target" onClick={() => window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank')}>
              <div className={`w-full flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between gap-12 px-6`}>
                <span className="px-0 py-0 my-0 font-semibold mx-px">{language === 'ar' ? 'انضم لبرنامج الولاء' : 'Join loyalty program'}</span>
                <img src="/lovable-uploads/ba9a65f1-bf31-4b9c-ab41-7c7228a2f1b7.png" alt="Rescale Logo" className="h-8 w-auto" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      <BranchDialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen} branches={branches} onBranchSelect={handleBranchSelect} />

      <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} branches={branches} onLocationClick={handleLocationClick} />

      <footer className="page-footer" />
    </div>;
};

export default Customer;
