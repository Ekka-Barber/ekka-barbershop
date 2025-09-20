
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Language, LanguageContextType } from '@/types/language';
import { translations } from '@/i18n/translations';
import { detectSystemLanguage, updateManifestLanguage, storeLanguagePreference } from '@/utils/languageUtils';

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return detectSystemLanguage();
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
    updateManifestLanguage(language);
    storeLanguagePreference(language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
