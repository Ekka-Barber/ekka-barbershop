import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="relative flex h-[52px] bg-white rounded-full p-1.5 shadow-lg w-[240px]">
        {/* English Option */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 flex-1 text-base font-medium transition-colors duration-200 rounded-full
            ${language === 'en' ? 'text-white' : 'text-gray-600'}`}
        >
          EN
        </button>
        
        {/* Arabic Option */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative z-10 flex-1 text-base font-medium transition-colors duration-200 rounded-full
            ${language === 'ar' ? 'text-white' : 'text-gray-600'}`}
        >
          عربي
        </button>
        
        {/* Sliding Background */}
        <div
          className={`absolute inset-y-1.5 w-[120px] rounded-full bg-[#C4A36F] transition-transform duration-300 ease-in-out
            ${language === 'ar' ? 'translate-x-[116px]' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
};