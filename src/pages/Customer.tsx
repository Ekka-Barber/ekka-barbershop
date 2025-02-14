
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
  const { t, language } = useLanguage();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*');
      
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

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="sticky-header">
        <div className="relative h-11">
          <div className="absolute right-0 top-0 h-full" style={{ direction: 'ltr' }}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-28 mx-auto mb-4"
          />
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-[#222222]">
              {t('welcome.line1')}
            </h2>
            <h1 className="text-2xl font-bold text-[#222222]">
              {t('welcome.line2')}
            </h1>
          </div>
          <div className="h-1 w-20 bg-[#C4A36F] mx-auto mt-3"></div>
        </div>

        <div className="space-y-3 bottom-nav">
          <Button 
            className="action-button bg-[#C4A36F] hover:bg-[#B39260] text-white shadow-md hover:shadow-lg"
            onClick={() => navigate('/menu')}
          >
            {t('view.menu')}
          </Button>
          
          <Button 
            className="action-button bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white shadow-md hover:shadow-lg"
            onClick={() => navigate('/offers')}
          >
            {t('special.offers')}
          </Button>

          <Button 
            className="action-button bg-[#C4A36F] hover:bg-[#B39260] text-white shadow-md hover:shadow-lg"
            onClick={() => setBranchDialogOpen(true)}
          >
            {t('book.now')}
          </Button>

          <Button 
            className="action-button bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white shadow-md hover:shadow-lg"
            onClick={() => setLocationDialogOpen(true)}
          >
            <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
              <MapPin className="h-4 w-4" />
              <span>{language === 'ar' ? 'فروعنا' : 'Our Branches'}</span>
            </div>
          </Button>

          <Button 
            className="action-button bg-white hover:bg-gray-50 text-gray-800 shadow-md hover:shadow-lg border border-gray-200"
            onClick={() => window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank')}
          >
            <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between px-4`}>
              <span>{language === 'ar' ? 'انضم لبرنامج الولاء' : 'Join loyalty program'}</span>
              <img 
                src="/lovable-uploads/ba9a65f1-bf31-4b9c-ab41-7c7228a2f1b7.png"
                alt="Rescale Logo" 
                className="h-6 w-auto"
              />
            </div>
          </Button>
        </div>
      </main>

      <BranchDialog
        open={branchDialogOpen}
        onOpenChange={setBranchDialogOpen}
        branches={branches}
        onBranchSelect={handleBranchSelect}
      />

      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        branches={branches}
        onLocationClick={handleLocationClick}
      />

      <footer className="page-footer" />
    </div>
  );
};

export default Customer;
