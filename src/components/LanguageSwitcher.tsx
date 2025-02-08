
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center">
      {/* Container with fixed width to prevent movement */}
      <div className="w-[100px] flex items-center justify-between">
        {/* Left button (English) - Fixed width */}
        <button
          onClick={() => setLanguage('en')}
          className={`w-[48px] h-11 rounded-md transition-colors duration-200 flex items-center justify-center
            ${language === 'en' 
              ? 'text-white bg-primary' 
              : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
            }`}
          aria-label="Switch to English"
        >
          EN
        </button>

        {/* Right button (Arabic) - Fixed width */}
        <button
          onClick={() => setLanguage('ar')}
          className={`w-[48px] h-11 rounded-md transition-colors duration-200 flex items-center justify-center
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
