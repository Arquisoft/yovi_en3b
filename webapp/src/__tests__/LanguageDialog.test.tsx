import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import * as useTranslation from '../i18n/useTranslation';
import { translations } from '../i18n/locales'; // Import your real locales

/**
 * Wraps the component in necessary Context Providers (Routes and Settings).
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

// Mock the translation hook with all necessary properties from your locales
vi.mock('../i18n/useTranslation', () => ({
  useI18n: vi.fn(() => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    t: translations.en, // Use real English translations for full coverage
  })),
}));

/**
 * Global stub for Web Audio API.
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
    expect(container.firstChild).toBeNull(); // Ensure it returns null if not open
  });

  test('renders when open and changes language to Spanish', () => {
    renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);

    // Access the translated title from the locale file
    expect(screen.getByText(translations.en.messages.selectLanguage)).toBeDefined();

    fireEvent.click(screen.getByText(translations.en.buttons.spanish)); // Click Spanish button
    expect(mockSetLanguage).toHaveBeenCalledWith('es'); // Verify language change
    expect(mockOnClose).toHaveBeenCalled(); // Verify modal closes
  });

  test('changes language to English', () => {
    renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(translations.en.buttons.english)); // Click English button
    expect(mockSetLanguage).toHaveBeenCalledWith('en'); // Verify language change
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('changes language to Turkish', () => {
    renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(translations.en.buttons.turkish)); // Click Turkish button
    expect(mockSetLanguage).toHaveBeenCalledWith('tr'); // Verify language change
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes when clicking the X button', () => {
    const { container } = renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    
    const modalContent = container.querySelector('.language-modal');
    const closeBtn = modalContent?.querySelector('.close-x-lang') as HTMLButtonElement;
    expect(closeBtn).toBeDefined();
    
    fireEvent.click(closeBtn); // Trigger click

    expect(mockOnClose).toHaveBeenCalled(); // Should trigger onClose
  });

  test('clicking overlay closes the dialog', () => {
    const { container } = renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    const overlay = container.querySelector('.language-overlay');
    expect(overlay).toBeDefined();

    if (overlay) fireEvent.click(overlay); // Click outside the dialog
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clicking inside modal content does not close (stopPropagation)', () => {
    const { container } = renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    const modalContent = container.querySelector('.language-modal');
    expect(modalContent).toBeDefined();

    if (modalContent) fireEvent.click(modalContent); // Click inside the dialog box
    expect(mockOnClose).not.toHaveBeenCalled(); // Should NOT call onClose due to e.stopPropagation()
  });

  test('marks the active language with correct CSS class', () => {
    // Override the mock to simulate Spanish as the current language
    vi.mocked(useTranslation.useI18n).mockReturnValue({
        language: 'es',
        setLanguage: mockSetLanguage,
        t: translations.es,
    });

    renderWithProviders(<LanguageDialog open={true} onClose={mockOnClose} />);
    
    const activeBtn = screen.getByText(translations.es.buttons.spanish);
    expect(activeBtn.className).toContain('active'); // Checks the ternary logic: language === 'es' ? 'active' : ''
  });
});