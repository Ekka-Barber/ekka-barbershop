import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow max-w-md mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#222222] mb-2">
            {t('welcome')} {t('ekka')}
          </h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto"></div>
        </div>

        {/* Navigation Buttons */}
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
        </div>
      </div>

      {/* Branch Selection Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-white to-gray-50 border-0 shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold text-[#403E43] mb-8">
              {language === 'ar' ? 'اختر الفرع' : 'Select Branch'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches?.map((branch) => (
              <Button
                key={branch.id}
                variant="outline"
                className="h-auto aspect-square p-8 flex flex-col items-center justify-center space-y-4 bg-white hover:bg-[#9b87f5]/5 border-2 border-gray-100 hover:border-[#9b87f5] transition-all duration-300 rounded-2xl group"
                onClick={() => handleBranchSelect(branch.id)}
              >
                <span className="font-semibold text-2xl text-[#403E43] group-hover:text-[#9b87f5] transition-colors text-center">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="text-base text-gray-500 group-hover:text-[#9b87f5]/70 transition-colors text-center">
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