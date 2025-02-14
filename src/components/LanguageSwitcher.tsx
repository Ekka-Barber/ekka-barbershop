
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="sticky top-0 z-50 h-11">
      <div className="max-w-md mx-auto h-full relative">
        <div className="absolute right-0 top-0 h-full flex items-center" style={{ direction: 'ltr' }}>
          <div className="w-[100px] flex items-center justify-between">
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
      </div>
    </div>
  );
};
