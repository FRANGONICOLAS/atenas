import { es } from './es';
import { en } from './en';

export type Language = 'es' | 'en';
export type Translation = typeof es;

export const translations = {
  es,
  en,
};

export const useTranslation = (lang: Language): Translation => {
  return translations[lang];
};
