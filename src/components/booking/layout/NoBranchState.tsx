
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const NoBranchState = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
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
  );
};
