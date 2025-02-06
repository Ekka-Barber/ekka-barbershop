import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PushNotificationToggle from "@/components/PushNotificationToggle";

const Customer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);

  // Fetch branches
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

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.error('Service worker registration failed:', err);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow max-w-md mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6"
          />
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

        <div className="space-y-4">
          <Button 
            className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/menu')}
          >
            {t('view.menu')}
          </Button>
          
          <Button 
            className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/offers')}
          >
            {t('special.offers')}
          </Button>

          <Button 
            className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => setBranchDialogOpen(true)}
          >
            {t('book.now')}
          </Button>

          {/* Loyalty Program Button */}
          <Button 
            className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
            onClick={() => window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank')}
          >
            <div className={`w-full flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between px-6`}>
              <span>{language === 'ar' ? 'انضم لبرنامج الولاء' : 'Join loyalty program'}</span>
              <img 
                src="/lovable-uploads/ba9a65f1-bf31-4b9c-ab41-7c7228a2f1b7.png"
                alt="Rescale Logo" 
                className="h-8 w-auto"
              />
            </div>
          </Button>
          
          <PushNotificationToggle />
        </div>
      </div>

      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#222222] mb-6">
              {t('select.branch')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {branches?.map((branch) => (
              <Button
                key={branch.id}
                variant="outline"
                className="h-[160px] flex flex-col items-center justify-center space-y-3 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
                onClick={() => handleBranchSelect(branch.id)}
              >
                <span className="font-semibold text-xl text-[#222222] group-hover:text-[#C4A36F] transition-colors text-center">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="text-sm text-gray-500 group-hover:text-[#C4A36F]/70 transition-colors text-center px-4">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <LanguageSwitcher />
    </div>
  );
};

export default Customer;
