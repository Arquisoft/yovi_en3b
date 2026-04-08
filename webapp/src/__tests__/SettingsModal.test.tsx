import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from '../components/Settings/SettingsModal';
import { SettingsProvider } from '../context/SettingsContext';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

/**
 * Wraps the component in the necessary Context Providers.
 * Consistent with the GameScreen example provided.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <SettingsProvider>
            {ui}
        </SettingsProvider>
    );
};

/**
 * Global mock for the Web Audio API.
 * Prevents "Audio is not a constructor" errors in JSDOM.
 */
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        catch: vi.fn(),
        load: vi.fn(),
        volume: 1,
        muted: false
    };
}));

/**
 * Mocking 'useI18n' hook for localized strings.
 */
vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            buttons: {
                settings: 'Settings',
                on: 'ON',
                off: 'OFF'
            },
            labels: {
                brightness: 'Brightness',
                volume: 'Volume',
                mute: 'Mute',
                colorBlindMode: 'Color Blind',
                neonEffects: 'Neon'
            },
        },
    }),
}));

describe('SettingsModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks(); // Clear history before each test
    });

    test('TEST 1: renders the settings title and labels', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText(/Brightness/i)).toBeInTheDocument();
        expect(screen.getByText(/Volume/i)).toBeInTheDocument();
    });

    test('TEST 2: brightness slider updates correctly', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        // Get all sliders and pick index 0 (Brightness)
        const sliders = screen.getAllByRole('slider');
        const brightnessSlider = sliders[0] as HTMLInputElement;
        
        fireEvent.change(brightnessSlider, { target: { value: '120' } });
        
        // Verify the value was updated in the DOM
        expect(brightnessSlider.value).toBe('120');
    });

    test('TEST 3: volume slider updates correctly', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        // Get all sliders and pick index 1 (Volume)
        const sliders = screen.getAllByRole('slider');
        const volumeSlider = sliders[1] as HTMLInputElement;
        
        fireEvent.change(volumeSlider, { target: { value: '45' } });
        
        expect(volumeSlider.value).toBe('45');
    });

    test('TEST 4: mute button toggles and disables volume slider', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        // Target the button next to the Mute label
        const muteButton = screen.getByText(/Mute/i).nextElementSibling as HTMLButtonElement;
        const sliders = screen.getAllByRole('slider');
        const volumeSlider = sliders[1] as HTMLInputElement;

        // Click to toggle Mute ON
        fireEvent.click(muteButton); 
        
        // Volume slider should now be disabled
        expect(volumeSlider).toBeDisabled();
    });

    test('TEST 5: color blind mode button toggles', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        const cbButton = screen.getByText(/Color Blind/i).nextElementSibling as HTMLButtonElement;
        
        const isCurrentlyActive = cbButton.className.includes('active');
        fireEvent.click(cbButton);
        
        // Class should toggle active state
        expect(cbButton.className.includes('active')).toBe(!isCurrentlyActive);
    });

    test('TEST 6: neon mode button toggles', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        const neonButton = screen.getByText(/Neon/i).nextElementSibling as HTMLButtonElement;
        
        const isCurrentlyActive = neonButton.className.includes('active');
        fireEvent.click(neonButton);
        
        expect(neonButton.className.includes('active')).toBe(!isCurrentlyActive);
    });

    test('TEST 7: close button (X) calls onClose', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        const closeBtn = screen.getByText('×');
        fireEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('TEST 8: clicking the overlay background calls onClose', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            fireEvent.click(overlay);
        }
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('TEST 9: clicking inside the modal content does NOT call onClose', () => {
        renderWithProviders(<SettingsModal onClose={mockOnClose} />);
        
        const content = document.querySelector('.modal-content');
        if (content) {
            fireEvent.click(content);
        }
        
        // Should not be called because click was inside the content box
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});