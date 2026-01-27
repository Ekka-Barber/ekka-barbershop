
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    const nextLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLanguage);
  };


  
  return (
    <button 
      onClick={handleLanguageToggle}
      className={`
        z-[9999] flex items-center justify-center w-10 h-10 rounded-full 
        bg-[#e9b353] text-white shadow-lg hover:bg-[#B39260] 
        transition-colors duration-300 border-2 border-white/30
        ${className}
      `}
      aria-label={language === 'ar' ? t('switch.to.english') : t('switch.to.arabic')}
    >
      <span className="text-sm font-semibold">ع/EN</span>
    </button>
  );
};
