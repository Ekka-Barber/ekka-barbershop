
import { Language } from "@shared/types/language";

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

  // Check if any of the system languages start with 'en' (English)
  const hasEnglish = systemLanguages.some(lang =>
    lang.toLowerCase().startsWith('en')
  );

  // Default to Arabic, unless system language is English
  return hasEnglish ? 'en' : 'ar';
};

export const storeLanguagePreference = (language: Language): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
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
