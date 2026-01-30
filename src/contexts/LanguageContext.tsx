
/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';

import { Language, LanguageContextType } from '@shared/types/language';
import { detectSystemLanguage, updateManifestLanguage, storeLanguagePreference } from '@shared/utils/languageUtils';

import { translations } from '@/i18n/translations';

// Route-specific language overrides
const ROUTE_LANGUAGE_OVERRIDES: Record<string, Language> = {
  '/owner': 'en',
  '/manager': 'ar',
};

// Get the enforced language for a given pathname, or null if no override
const getEnforcedLanguage = (pathname: string): Language | null => {
  for (const [routePrefix, forcedLang] of Object.entries(ROUTE_LANGUAGE_OVERRIDES)) {
    if (pathname.startsWith(routePrefix)) {
      return forcedLang;
    }
  }
  return null;
};

// Create the context with a default value
const LanguageContext = React.createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLanguage, setUserLanguage] = React.useState<Language>(() => {
    return detectSystemLanguage();
  });
  
  // Use state to track pathname changes since we can't use useLocation outside Router
  const [pathname, setPathname] = React.useState(() => 
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Listen for navigation events
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);
    
    // Also check periodically for pushState/replaceState changes
    const interval = setInterval(() => {
      if (window.location.pathname !== pathname) {
        setPathname(window.location.pathname);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [pathname]);

  // Determine effective language based on route overrides
  const effectiveLanguage = React.useMemo(() => {
    const enforced = getEnforcedLanguage(pathname);
    return enforced ?? userLanguage;
  }, [pathname, userLanguage]);

  React.useEffect(() => {
    document.documentElement.dir = effectiveLanguage === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', effectiveLanguage === 'ar');
    updateManifestLanguage(effectiveLanguage);
    // Only store preference if not on a route with enforced language
    if (!getEnforcedLanguage(pathname)) {
      storeLanguagePreference(userLanguage);
    }
  }, [effectiveLanguage, pathname, userLanguage]);

  const setLanguage = React.useCallback((lang: Language) => {
    // Only allow setting language if not on a route with enforced language
    if (!getEnforcedLanguage(window.location.pathname)) {
      setUserLanguage(lang);
    }
  }, []);

  const t = React.useCallback((key: string): string => {
    return translations[effectiveLanguage][key] || key;
  }, [effectiveLanguage]);

  const value = React.useMemo(() => ({
    language: effectiveLanguage,
    setLanguage,
    t
  }), [effectiveLanguage, setLanguage, t]);

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
