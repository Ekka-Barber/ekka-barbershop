
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLanguage);
  };

  return (
    <button 
      onClick={handleLanguageToggle}
      className={`
        fixed z-50 flex items-center justify-center w-12 h-12 rounded-full 
        bg-[#C4A36F] text-white shadow-lg hover:bg-[#B39260] 
        transition-colors duration-300
        top-[calc(1.25rem+env(safe-area-inset-top))] 
        right-[calc(1.25rem+env(safe-area-inset-right))]
      `}
      aria-label={language === 'ar' ? "Switch to English" : "التحويل الى العربية"}
    >
      <Globe className="w-6 h-6" />
    </button>
  );
};
