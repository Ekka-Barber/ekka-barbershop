import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-2 fixed top-4 right-4">
      <span className={`text-sm ${language === 'en' ? 'font-bold' : ''}`}>EN</span>
      <Switch
        checked={language === 'ar'}
        onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
      />
      <span className={`text-sm ${language === 'ar' ? 'font-bold' : ''}`}>عربي</span>
    </div>
  );
};