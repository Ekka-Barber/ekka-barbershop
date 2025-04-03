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
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#C4A36F] text-white shadow-lg hover:bg-[#B39260] transition-colors duration-300"
      aria-label={language === 'ar' ? "Switch to English" : "التحويل الى العربية"}
      style={{ 
        // Use safe-area-inset for notch compatibility
        bottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px))`,
        right: `calc(1.25rem + env(safe-area-inset-right, 0px))` 
      }}
    >
      {/* Display the language to switch TO */}
      <span className="text-lg font-medium">
        {language === 'ar' ? 'En' : 'ع'}
      </span>
      {/* Optional: Keep the Globe icon if preferred */}
      {/* <Globe className="w-5 h-5" /> */}
    </button>
  );
};
