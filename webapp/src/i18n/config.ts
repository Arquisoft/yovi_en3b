import { translations } from './locales';

export type Language = 'es' | 'en';

export const DEFAULT_LANGUAGE: Language = 'es';
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export function getTranslation(lang: Language): typeof translations.es {
  return translations[lang];
}
