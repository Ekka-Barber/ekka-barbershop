
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-1">
      {/* Left button (English) - Always stays on left */}
      <div className="relative">
        <button
          onClick={() => setLanguage('en')}
          className={`min-w-[44px] h-11 px-3 rounded-md transition-colors duration-200
            ${language === 'en' 
              ? 'text-white bg-primary' 
              : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          aria-label="Switch to English"
        >
          EN
        </button>
      </div>

      {/* Right button (Arabic) - Always stays on right */}
      <div className="relative">
        <button
          onClick={() => setLanguage('ar')}
          className={`min-w-[44px] h-11 px-3 rounded-md transition-colors duration-200
            ${language === 'ar' 
              ? 'text-white bg-primary' 
              : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          aria-label="Switch to Arabic"
        >
          عربي
        </button>
      </div>
    </div>
  );
};
