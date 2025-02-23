
import { Language } from "@/types/language";

export const detectSystemLanguage = (): Language => {
  const systemLanguages = navigator.languages || [navigator.language];
  
  // Check if any of the system languages start with 'ar'
  const hasArabic = systemLanguages.some(lang => 
    lang.toLowerCase().startsWith('ar')
  );
  
  return hasArabic ? 'ar' : 'en';
};

export const updateManifestLanguage = (language: Language) => {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    const currentHref = manifestLink.getAttribute('href');
    const newHref = currentHref?.includes('?') 
      ? `${currentHref}&lang=${language}`
      : `${currentHref}?lang=${language}`;
    manifestLink.setAttribute('href', newHref);
  }
};
