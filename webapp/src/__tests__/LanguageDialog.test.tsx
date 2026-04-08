
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';

/**
 * Wraps the component in the necessary Context Providers (Routes and Settings).
 * Similar to Dependency Injection in Backend: it provides the "services"
 * (Navigation and Global State) that the component needs to run without crashing.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        </BrowserRouter>
    );
};

const mockSetLanguage = vi.fn();
const mockOnClose = vi.fn();

vi.mock('../i18n/useTranslation', () => ({
  useI18n: () => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: {
      buttons: { spanish: 'SPANISH', english: 'ENGLISH' },
      messages: { selectLanguage: 'SELECT LANGUAGE' },
    },
  }),
}));

/**
 * Global mock for the Web Audio API.
 * JSDOM (the test environment) does not support audio playback. 
 * This stub replaces the native 'Audio' constructor with a fake object 
 * to prevent "TypeError: Audio is not a constructor" or ".play() is undefined" errors.
 */
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        catch: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        loop: false,
        volume: 1,
        muted: false
    };
}));

describe('LanguageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders nothing when closed', () => {
    const { container } = renderWithProviders(<LanguageDialog open={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders when open and changes language', () => {
    renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/SELECT LANGUAGE/i)).toBeDefined();

    fireEvent.click(screen.getByText('SPANISH'));
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clicking overlay closes the dialog', () => {
    const { container } = renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    const overlay = container.querySelector('.language-overlay');
    expect(overlay).toBeDefined();

    if (overlay) fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clicking inside modal content does not close', () => {
    const { container } = renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    const content = container.querySelector('.modal-content');
    expect(content).toBeDefined();

    if (content) fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
