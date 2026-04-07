import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import HowToPlay from '../components/HowToPlay/HowToPlay'; 
import { SettingsProvider } from '../context/SettingsContext';
import { BrowserRouter } from 'react-router-dom';

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

vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            messages: {
                howToPlay: 'HOW TO PLAY', // Asegúrate de que coincida con el texto que buscas
                wantToSeeAction: 'Want to see it in action?'
            },
            buttons: {
                watchVideo: 'Watch Gameplay & Tutorial',
                understood: 'UNDERSTOOD'
            },
            instructions: {
                step1Title: 'The Choice',
                step1Text: 'Description 1',
                step2Title: 'Connection',
                step2Text: 'Description 2',
                step3Title: 'The "Y" Goal',
                step3Text: 'Description 3',
            }
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

describe('HowToPlay Component', () => {
    const mockOnClose = vi.fn(); 

    beforeEach(() => {
        vi.clearAllMocks(); 
    });

    test('1. Renders all main instructions and title', () => {
       renderWithProviders(<HowToPlay onClose={mockOnClose} />);
        
        // Verify the main title is present
        expect(screen.getByText(/HOW TO PLAY/i)).toBeDefined();

        // Verify that the 3 steps exist
        expect(screen.getByText(/The Choice/i)).toBeDefined();
        expect(screen.getByText(/Connection/i)).toBeDefined();
        expect(screen.getByText(/The "Y" Goal/i)).toBeDefined();
    });

    test('2. Contains the tutorial video link with correct attributes', () => {
        renderWithProviders(<HowToPlay onClose={mockOnClose} />);
        
        const videoLink = screen.getByRole('link', { name: /Watch Gameplay & Tutorial/i });
        
        // Verify URL of YouTube
        expect(videoLink.getAttribute('href')).toBe('https://youtu.be/eDGei98yBtY');
        
        // Important for security and SEO: target _blank requires rel noopener
        expect(videoLink.getAttribute('target')).toBe('_blank');
        expect(videoLink.getAttribute('rel')).toContain('noopener');
    });

    test('3. Calls onClose when clicking the "X" button', () => {
        renderWithProviders(<HowToPlay onClose={mockOnClose} />);
        
        const closeBtn = screen.getByText('×'); 
        fireEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('4. Calls onClose when clicking the "UNDERSTOOD" button', () => {
        renderWithProviders(<HowToPlay onClose={mockOnClose} />);
        
        const understoodBtn = screen.getByText(/UNDERSTOOD/i);
        fireEvent.click(understoodBtn);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('5. Renders the visual board representation', () => {
        const { container } = renderWithProviders(<HowToPlay onClose={mockOnClose} />);
        
        // Verify that the ball rows exist (visual representation)
        const rows = container.querySelectorAll('.balls-row');
        expect(rows.length).toBe(3);

        // Verify that red and blue balls exist
        const redBalls = container.querySelectorAll('.ball.p1-color');
        const blueBalls = container.querySelectorAll('.ball.p2-color');
        
        expect(redBalls.length).toBeGreaterThan(0);
        expect(blueBalls.length).toBeGreaterThan(0);
    });
});