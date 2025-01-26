import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="relative flex h-12 bg-white rounded-full p-1 shadow-lg w-[200px]">
        {/* English Option */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-200 rounded-full
            ${language === 'en' ? 'text-gray-900' : 'text-gray-500'}`}
        >
          EN
        </button>
        
        {/* Arabic Option */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-200 rounded-full
            ${language === 'ar' ? 'text-gray-900' : 'text-gray-500'}`}
        >
          عربي
        </button>
        
        {/* Sliding Background */}
        <div
          className={`absolute inset-y-1 w-[100px] rounded-full bg-[#C4A36F] transition-transform duration-200 ease-in-out
            ${language === 'ar' ? 'translate-x-[100px]' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
};