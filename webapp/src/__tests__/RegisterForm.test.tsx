import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../components/Login/RegisterForm';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { SettingsProvider } from '../context/SettingsContext';
import { I18nProvider } from '../i18n/Provider'; // Import the translation provider

/**
 * Wraps the component in all necessary Context Providers.
 * Added I18nProvider to avoid "useI18n must be used within I18nProvider" error.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <I18nProvider> {/* Must be the outermost or wrap settings */}
                <SettingsProvider>
                    {ui}
                </SettingsProvider>
            </I18nProvider>
        </BrowserRouter>
    );
};

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

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

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        localStorage.clear(); // Ensure a clean state for language and tokens
    });

    test('1. Shows error when fields are empty', async () => {
        renderWithProviders(<RegisterForm />);
        
        // Click play without filling inputs
        const playBtn = screen.getByText(/PLAY/i);
        fireEvent.click(playBtn);

        // Verify error message (In English because it's usually the default)
        expect(await screen.findByText(/Please fill in all fields/i)).toBeDefined();
    });

    test('2. Navigates on successful login', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            headers: { get: () => 'Bearer fake-token' },
            json: async () => ({ id: '123' }),
        });

        renderWithProviders(<RegisterForm />);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /PLAY/i }));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/menu'));
    });

    test('3. Shows error message on API failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        renderWithProviders(<RegisterForm />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /PLAY/i }));

        const errorMessage = await screen.findByText(/Invalid credentials/i);
        expect(errorMessage).toBeDefined();
    });

    test('4. Navigates to signup on button click', async () => {
        renderWithProviders(<RegisterForm />);
        
        const signUpBtn = screen.getByText(/SIGN UP/i);
        fireEvent.click(signUpBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    test('5. Clears error when user starts typing', async () => {
        renderWithProviders(<RegisterForm />);
        
        fireEvent.click(screen.getByText(/PLAY/i));
        expect(screen.getByText(/Please fill in all fields/i)).toBeDefined();

        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });

        // Error should still be visible until both fields are filled
        expect(screen.queryByText(/Please fill in all fields/i)).toBeDefined();
    });

    test('6. Handles network error gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        renderWithProviders(<RegisterForm />);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /PLAY/i }));

        // Check for the translated network error message
        await waitFor(() => {
            expect(screen.getByText(/Cannot connect to the server/i)).toBeDefined();
        });
    });

    test('6. Loading state is active while API is calling', async () => {
        let resolveResponse: any;
        const responsePromise = new Promise(resolve => { resolveResponse = resolve; });
        (global.fetch as any).mockReturnValue(responsePromise);

        renderWithProviders(<RegisterForm />);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });

        const playBtn = screen.getByRole('button', { name: /PLAY/i }) as HTMLButtonElement;
        fireEvent.click(playBtn);

        // Check for "LOADING..." text inside the button
        expect(screen.getByText(/LOADING/i)).toBeDefined();
        expect(playBtn.disabled).toBe(true);

        resolveResponse({
            ok: true,
            headers: { get: () => 'Bearer token' },
            json: async () => ({ id: '123' }),
        });
    });
});
