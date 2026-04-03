import { translations } from './locales';

export type Language = 'es' | 'en' | 'tr';

export const DEFAULT_LANGUAGE: Language = 'es';
export const SUPPORTED_LANGUAGES = ['es', 'en', 'tr'] as const;

export function getTranslation(lang: Language): typeof translations.es {
  return translations[lang];
}