import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nContext, useI18n } from '../i18n/useTranslation';
import { translations } from '../i18n/locales';

const TestComponent: React.FC = () => {
  const { language, t } = useI18n();
  return (
    <div>
      {language}-{t.buttons.play}
    </div>
  );
};

describe('useI18n', () => {
  test('throws if used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow('useI18n must be used within I18nProvider');
  });

  test('returns context values when provider exists', () => {
    render(
      <I18nContext.Provider value={{ language: 'en', setLanguage: vi.fn(), t: translations.en }}>
        <TestComponent />
      </I18nContext.Provider>
    );

    expect(screen.getByText('en-PLAY')).toBeDefined();
  });
});
