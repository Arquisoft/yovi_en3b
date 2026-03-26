import { describe, expect, test } from 'vitest';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getTranslation } from '../i18n/config';
import { translations } from '../i18n/locales';

describe('i18n config', () => {
  test('DEFAULT_LANGUAGE is supported', () => {
    expect(SUPPORTED_LANGUAGES).toContain(DEFAULT_LANGUAGE);
  });

  test('getTranslation returns the correct locale object', () => {
    expect(getTranslation('es')).toBe(translations.es);
    expect(getTranslation('en')).toBe(translations.en);
  });

  test('translations include required keys', () => {
    expect(translations.es.buttons.play).toBeDefined();
    expect(translations.en.buttons.play).toBeDefined();
    expect(translations.es.messages.loading).toBeDefined();
    expect(translations.en.messages.loading).toBeDefined();
  });
});
