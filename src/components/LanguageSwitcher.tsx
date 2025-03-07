
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { detectSystemLanguage } from "@/utils/languageUtils";
import { useLocation } from "react-router-dom";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  useEffect(() => {
    // Set the language once based on system preference on initial load
    const detectedLanguage = detectSystemLanguage();
    setLanguage(detectedLanguage);
    
    // Only show the language switcher on the customer page
    setShowSwitcher(location.pathname === '/customer');
  }, [location.pathname, setLanguage]);
  
  if (!showSwitcher) return null;
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button 
          className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 animate-fade-in"
          aria-label="Change Language"
          style={{ 
            bottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px))`,
            right: `calc(1.25rem + env(safe-area-inset-right, 0px))` 
          }}
        >
          <Globe className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl h-auto pb-10 pt-6 px-4">
        <div className="space-y-4">
          <h3 className="text-center text-lg font-medium text-[#F1F1F1]">
            {language === 'ar' ? 'اختر اللغة' : 'Select Language'}
          </h3>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setLanguage('en')}
              className={`w-32 h-14 rounded-md transition-colors duration-200 flex items-center justify-center text-lg
                ${language === 'en' 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                }`}
              aria-label="Switch to English"
            >
              English
            </button>

            <button
              onClick={() => setLanguage('ar')}
              className={`w-32 h-14 rounded-md transition-colors duration-200 flex items-center justify-center text-lg
                ${language === 'ar' 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                }`}
              aria-label="Switch to Arabic"
            >
              العربية
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
