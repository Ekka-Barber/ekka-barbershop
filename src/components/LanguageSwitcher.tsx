import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="relative flex h-10 bg-white/90 backdrop-blur-md rounded-lg p-1 shadow-lg border border-gray-100">
        {/* English Option */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 w-[72px] text-sm font-medium transition-colors duration-200
            ${language === 'en' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          EN
        </button>
        
        {/* Arabic Option */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative z-10 w-[72px] text-sm font-medium transition-colors duration-200
            ${language === 'ar' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          عربي
        </button>
        
        {/* Sliding Background */}
        <div
          className={`absolute inset-y-1 w-[72px] rounded-md bg-primary transition-transform duration-200 ease-in-out
            ${language === 'ar' ? 'translate-x-[72px]' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
};