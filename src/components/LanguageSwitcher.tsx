import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-gray-100">
        {/* English Button */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative px-4 py-2 rounded-md transition-all duration-200 min-w-[72px]
            ${language === 'en' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 text-gray-600'
            }`}
          aria-label="Switch to English"
        >
          <span className="relative z-10">EN</span>
        </button>

        {/* Arabic Button */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative px-4 py-2 rounded-md transition-all duration-200 min-w-[72px]
            ${language === 'ar' 
              ? 'bg-primary text-white' 
              : 'hover:bg-gray-100 text-gray-600'
            }`}
          aria-label="Switch to Arabic"
        >
          <span className="relative z-10">عربي</span>
        </button>
      </div>
    </div>
  );
};