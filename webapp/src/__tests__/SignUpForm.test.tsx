import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import SignUpForm from '../components/SignUp/SignUpForm';
import { SettingsProvider } from '../context/SettingsContext';
import { I18nProvider } from '../i18n/Provider'; // Import context provider

/**
 * Wraps the component with all required providers, including I18n.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <I18nProvider>
            <SettingsProvider>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </SettingsProvider>
        </I18nProvider>
    );
};

// Global fetch mock
global.fetch = vi.fn();

// Global mock for the Web Audio API
vi.stubGlobal('Audio', vi.fn().mockImplementation(function () {
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

describe('SignUpForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear(); // Clear storage to ensure default language (EN)
    });

    test('1. Renders all input fields and avatars', () => {
        renderWithProviders(<SignUpForm />);
        
        // We use translated labels (assuming English default in tests)
        expect(screen.getByText(/NICKNAME/i)).toBeDefined(); 
        expect(screen.getByText(/USERNAME/i)).toBeDefined(); 
        expect(screen.getByText(/EMAIL/i)).toBeDefined(); 
        expect(screen.getByRole('button', { name: /SAVE ACCOUNT/i })).toBeDefined(); 
        
        const avatars = screen.getAllByRole('button').filter(btn => 
            ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"].includes(btn.textContent || "")
        );
        expect(avatars.length).toBe(6); 
    });

    test('2. Toggles password visibility', () => {
        renderWithProviders(<SignUpForm />);
        // Find input by label text
        const passInput = screen.getByLabelText(/PASSWORD/i) as HTMLInputElement;
        
        // Find the toggle button (it usually has no text, so we find it by its child svg or position)
        const toggleBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg')); 

        expect(passInput.type).toBe('password'); 
        
        if (toggleBtn) fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('text'); 
        
        if (toggleBtn) fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('password'); 
    });

    test('3. Updates validation UI as user types password', () => {
        renderWithProviders(<SignUpForm />);
        const passInput = screen.getByLabelText(/PASSWORD/i);

        fireEvent.change(passInput, { target: { name: 'password', value: 'Password123!' } });

        // Using regex to match translated validation rules
        const validationItems = screen.getAllByText(/8\+ chars|Uppercase|Number|Special/i);
        validationItems.forEach(item => {
            // We check the parent because the 'valid' class is usually on the container
            expect(item.parentElement?.className).toContain('valid'); 
        });
    });

    test('4. Successfully creates account and navigates', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User created' }),
        });

        renderWithProviders(<SignUpForm />);

        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'john@test.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        const submitBtn = screen.getByRole('button', { name: /SAVE ACCOUNT/i });
        fireEvent.click(submitBtn);

        // Check for translated loading state
        expect(await screen.findByText(/CREATING/i)).toBeDefined(); 

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test('5. Shows error message on API failure', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Email already exists' }),
        });

        renderWithProviders(<SignUpForm />);
        
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'b' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'c@d.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(screen.getByRole('button', { name: /SAVE ACCOUNT/i }));

        const errorMsg = await screen.findByText(/Email already exists/i);
        expect(errorMsg).toBeDefined(); 
    });

    test('6. Handles server connection error', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        renderWithProviders(<SignUpForm />);
        
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'b' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'c@d.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(screen.getByRole('button', { name: /SAVE ACCOUNT/i }));

        // Search for the translated connection error message
        const errorMsg = await screen.findByText(/Cannot connect to the server/i);
        expect(errorMsg).toBeDefined(); 
    });

    test('7. Disables submit button when password is invalid', () => {
        renderWithProviders(<SignUpForm />);
        
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'john@test.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'short' } });

        const submitBtn = screen.getByRole('button', { name: /SAVE ACCOUNT/i }) as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(true);
    });
});