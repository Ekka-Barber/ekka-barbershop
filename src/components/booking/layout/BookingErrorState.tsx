
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const BookingErrorState = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
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
        {language === 'ar' ? 'العودة' : 'Go Back'}
      </Button>
    </div>
  );
};
