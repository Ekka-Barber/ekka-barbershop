import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useEffect } from "react";
import { detectSystemLanguage } from "@/utils/languageUtils";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  // Set initial language based on system preference
  useEffect(() => {
    const detectedLanguage = detectSystemLanguage();
    setLanguage(detectedLanguage);
  }, [setLanguage]); // Run only once on mount

  const handleLanguageToggle = () => {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLanguage);
  };

  return (
    <button 
      onClick={handleLanguageToggle}
      className="fixed top-5 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#C4A36F] text-white shadow-lg hover:bg-[#B39260] transition-colors duration-300"
      aria-label={language === 'ar' ? "Switch to English" : "التحويل الى العربية"}
      style={{ 
        // Use safe-area-inset-top and right for notch compatibility
        top: `calc(1.25rem + env(safe-area-inset-top, 0px))`,
        right: `calc(1.25rem + env(safe-area-inset-right, 0px))` 
      }}
    >
      {/* Replaced language text with Globe icon */}
      <Globe className="w-6 h-6" />
    </button>
  );
};
