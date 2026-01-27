
/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';

import { Language, LanguageContextType } from '@shared/types/language';
import { detectSystemLanguage, updateManifestLanguage, storeLanguagePreference } from '@shared/utils/languageUtils';

import { translations } from '@/i18n/translations';

// Create the context with a default value
const LanguageContext = React.createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState<Language>(() => {
    return detectSystemLanguage();
  });

  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
    updateManifestLanguage(language);
    storeLanguagePreference(language);
  }, [language]);

  const t = React.useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
