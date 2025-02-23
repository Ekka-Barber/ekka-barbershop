
export type Language = 'en' | 'ar';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}
