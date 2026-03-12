import React from 'react';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n/Provider';
import { I18nContext } from '../i18n/useTranslation';

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders children before loading localStorage', () => {
    render(
      <I18nProvider>
        <div>child</div>
      </I18nProvider>
    );

    expect(screen.getByText('child')).toBeDefined();
  });

  test('loads language from localStorage and updates on setLanguage', async () => {
    localStorage.setItem('language', 'en');

    const Probe: React.FC = () => (
      <I18nContext.Consumer>
        {(value) => (
          <div>
            <span data-testid="lang">{value ? value.language : 'none'}</span>
            <button onClick={() => value?.setLanguage('es')}>set-es</button>
          </div>
        )}
      </I18nContext.Consumer>
    );

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('en');
    });

    fireEvent.click(screen.getByText('set-es'));

    await waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('es');
    });

    expect(localStorage.getItem('language')).toBe('es');
  });
});
