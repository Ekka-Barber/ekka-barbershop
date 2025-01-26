import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Customer = () => {
  const navigate = useNavigate();
  const [isRTL, setIsRTL] = useState(false);
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setIsRTL(!isRTL)}
            className="text-brand-dark hover:text-brand-gold"
          >
            {isRTL ? 'English' : 'عربي'}
          </Button>
        </div>
        
        <img 
          src="/lovable-uploads/42f47719-cfd2-4c0d-8740-76e279f30c34.png"
          alt="Ekkah Logo"
          className="w-32 h-32 mx-auto mb-8"
        />
        
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark text-center mb-6 sm:mb-8">
          {isRTL ? 'مرحباً بكم' : 'Welcome'}
        </h1>
        
        <div className="grid grid-cols-1 gap-4">
          <Button 
            className="h-14 sm:h-16 text-base sm:text-lg bg-brand-gold hover:bg-brand-gold/90 text-white w-full"
            onClick={() => navigate('/menu')}
          >
            {isRTL ? 'عرض القائمة' : 'View Menu'}
          </Button>
          
          <Button 
            className="h-14 sm:h-16 text-base sm:text-lg bg-brand-gold hover:bg-brand-gold/90 text-white w-full"
            onClick={() => navigate('/offers')}
          >
            {isRTL ? 'العروض الخاصة' : 'Special Offers'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Customer;