
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';

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

describe('LanguageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders nothing when closed', () => {
    const { container } = render(<LanguageDialog open={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders when open and changes language', () => {
    render(<LanguageDialog open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/SELECT LANGUAGE/i)).toBeDefined();

    fireEvent.click(screen.getByText('SPANISH'));
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clicking overlay closes the dialog', () => {
    const { container } = render(<LanguageDialog open={true} onClose={mockOnClose} />);
    const overlay = container.querySelector('.modal-overlay');
    expect(overlay).toBeDefined();

    if (overlay) fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clicking inside modal content does not close', () => {
    const { container } = render(<LanguageDialog open={true} onClose={mockOnClose} />);
    const content = container.querySelector('.modal-content');
    expect(content).toBeDefined();

    if (content) fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
