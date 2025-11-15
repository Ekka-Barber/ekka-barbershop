
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLanguage);
  };

  return (
    <button 
      onClick={handleLanguageToggle}
      className={`
        fixed z-50 flex items-center justify-center w-12 h-12 rounded-full 
        bg-[#C4A36F] text-white shadow-lg hover:bg-[#B39260] 
        transition-colors duration-300
        top-[calc(1.25rem+env(safe-area-inset-top))] 
        right-[calc(1.25rem+env(safe-area-inset-right))]
      `}
      aria-label={language === 'ar' ? t('switch.to.english') : t('switch.to.arabic')}
    >
      <span className="text-sm font-semibold">ع/EN</span>
    </button>
  );
};
