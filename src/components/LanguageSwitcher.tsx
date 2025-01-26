import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="relative flex h-10 w-[144px] bg-white/90 backdrop-blur-md rounded-lg p-1 shadow-lg border border-gray-100">
        {/* English Option - Always on the left */}
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 w-[72px] text-sm font-medium transition-colors duration-200
            ${language === 'en' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          EN
        </button>
        
        {/* Arabic Option - Always on the right */}
        <button
          onClick={() => setLanguage('ar')}
          className={`relative z-10 w-[72px] text-sm font-medium transition-colors duration-200
            ${language === 'ar' ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          عربي
        </button>
        
        {/* Sliding Background - Only this moves */}
        <div
          className={`absolute left-1 top-1 w-[72px] h-8 rounded-md bg-primary transition-transform duration-200 ease-in-out
            ${language === 'ar' ? 'translate-x-[70px]' : 'translate-x-0'}`}
        />
      </div>
    </div>
  );
};