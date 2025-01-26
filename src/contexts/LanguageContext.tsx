import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Customer page
    'welcome': 'Welcome to',
    'ekka': 'Ekka Barbershop',
    'view.menu': 'View Menu',
    'special.offers': 'Special Offers',
    // Menu page
    'our.menu': 'Our Menu',
    'back.home': 'Back to Home',
    'loading.menu': 'Loading menu...',
    'no.menu': 'No menu available at the moment.',
    // Offers page
    'special.offers.title': 'Special Offers',
    'loading.offers': 'Loading offers...',
    'no.offers': 'No special offers available at the moment.',
  },
  ar: {
    // Customer page
    'welcome': 'مرحبا بك في',
    'ekka': 'صالون إكه للعناية بالرجل',
    'view.menu': 'قائمة الأسعار',
    'special.offers': 'العروض',
    // Menu page
    'our.menu': 'قائمة الأسعار',
    'back.home': 'العودة للرئيسية',
    'loading.menu': 'جاري تحميل القائمة...',
    'no.menu': 'لا تتوفر قائمة حالياً.',
    // Offers page
    'special.offers.title': 'العروض',
    'loading.offers': 'جاري تحميل العروض...',
    'no.offers': 'لا تتوفر عروض خاصة حالياً.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};