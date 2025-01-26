import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <footer className="mt-12 pb-6">
      <div className="relative bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-gray-100 max-w-fit mx-auto">
        <div className="flex items-center gap-1.5">
          {/* Left button (English) - Always stays on left */}
          <div className="relative w-[72px]">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full h-9 rounded-md transition-colors duration-200
                ${language === 'en' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            {language === 'en' && (
              <div className="absolute inset-0 bg-primary rounded-md -z-10" />
            )}
          </div>

          {/* Right button (Arabic) - Always stays on right */}
          <div className="relative w-[72px]">
            <button
              onClick={() => setLanguage('ar')}
              className={`w-full h-9 rounded-md transition-colors duration-200
                ${language === 'ar' ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-label="Switch to Arabic"
            >
              عربي
            </button>
            {language === 'ar' && (
              <div className="absolute inset-0 bg-primary rounded-md -z-10" />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};