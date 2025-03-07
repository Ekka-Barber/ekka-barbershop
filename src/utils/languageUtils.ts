
import { Language } from "@/types/language";

// Key used for storing language preference
const LANGUAGE_STORAGE_KEY = 'ekka-language-preference';

export const detectSystemLanguage = (): Language => {
  // First check if there's a stored preference
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === 'en' || storedLanguage === 'ar') {
    return storedLanguage;
  }
  
  // Fall back to system language detection
  const systemLanguages = navigator.languages || [navigator.language];
  
  // Check if any of the system languages start with 'ar'
  const hasArabic = systemLanguages.some(lang => 
    lang.toLowerCase().startsWith('ar')
  );
  
  return hasArabic ? 'ar' : 'en';
};

export const storeLanguagePreference = (language: Language): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export const updateManifestLanguage = (language: Language) => {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    // Set the appropriate manifest based on language
    const manifestPath = language === 'ar' ? '/manifest.ar.json' : '/manifest.json';
    manifestLink.setAttribute('href', manifestPath);
  }
};
