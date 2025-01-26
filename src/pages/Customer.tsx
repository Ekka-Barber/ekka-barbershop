import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Customer = () => {
  const navigate = useNavigate();
  const [isRTL, setIsRTL] = useState(false);
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-6" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            onClick={() => setIsRTL(!isRTL)}
            className="text-brand-dark hover:text-brand-gold transition-colors"
          >
            {isRTL ? 'English' : 'عربي'}
          </Button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <img 
            src="/lovable-uploads/42f47719-cfd2-4c0d-8740-76e279f30c34.png"
            alt="Ekkah Logo"
            className="w-32 h-32 object-contain drop-shadow-xl"
          />
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
          {isRTL ? 'مرحباً بكم' : 'Welcome'}
        </h1>

        {/* Navigation Buttons */}
        <div className="space-y-4 w-full px-4">
          <Button 
            className="w-full h-14 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            onClick={() => navigate('/menu')}
          >
            {isRTL ? 'عرض القائمة' : 'View Menu'}
          </Button>
          
          <Button 
            className="w-full h-14 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
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