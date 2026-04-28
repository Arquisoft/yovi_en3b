import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../components/Login/RegisterForm';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { SettingsProvider } from '../context/SettingsContext';
import { I18nProvider } from '../i18n/Provider';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <I18nProvider>
                <SettingsProvider>
                    {ui}
                </SettingsProvider>
            </I18nProvider>
        </BrowserRouter>
    );
};

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

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

const getUsernameInput = () => document.querySelector('input[id="login-username"]') as HTMLInputElement;
const getPasswordInput = () => document.querySelector('input[id="login-password"]') as HTMLInputElement;
const getSubmitBtn     = () => document.querySelector('button[type="submit"]')       as HTMLButtonElement;
const getSignupBtn     = () => document.querySelector('button.auth-link')            as HTMLButtonElement;

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        localStorage.clear();
    });

    test('1. Shows error when fields are empty', async () => {
        renderWithProviders(<RegisterForm />);

        fireEvent.click(getSubmitBtn());

        const errorMsg = await screen.findByText(
            /Please fill in all fields|Por favor, rellena todos los campos|Lütfen tüm alanları doldurun/i
        );
        expect(errorMsg).toBeDefined();
    });

    test('2. Navigates on successful login', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            headers: { get: () => 'Bearer fake-token' },
            json: async () => ({ id: '123' }),
        });

        renderWithProviders(<RegisterForm />);

        fireEvent.change(getUsernameInput(), { target: { value: 'user' } });
        fireEvent.change(getPasswordInput(), { target: { value: 'pass' } });
        fireEvent.click(getSubmitBtn());

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/menu'));
    });

    test('3. Shows error message on API failure', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        renderWithProviders(<RegisterForm />);

        fireEvent.change(getUsernameInput(), { target: { value: 'user' } });
        fireEvent.change(getPasswordInput(), { target: { value: 'pass' } });
        fireEvent.click(getSubmitBtn());

        const errorMsg = await screen.findByText(/Invalid credentials/i);
        expect(errorMsg).toBeDefined();
    });

    test('4. Navigates to signup on button click', async () => {
        renderWithProviders(<RegisterForm />);

        fireEvent.click(getSignupBtn());

        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    test('5. Handles network error gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        renderWithProviders(<RegisterForm />);

        fireEvent.change(getUsernameInput(), { target: { value: 'user' } });
        fireEvent.change(getPasswordInput(), { target: { value: 'pass' } });
        fireEvent.click(getSubmitBtn());

        await waitFor(() => {
            expect(screen.getByText(
                /Cannot connect to the server|No se puede conectar con el servidor|Sunucuya bağlanılamıyor/i
            )).toBeDefined();
        });
    });

    test('6. Loading state is active while API is calling', async () => {
        let resolveResponse: any;
        const responsePromise = new Promise(resolve => { resolveResponse = resolve; });
        (global.fetch as any).mockReturnValue(responsePromise);

        renderWithProviders(<RegisterForm />);

        fireEvent.change(getUsernameInput(), { target: { value: 'user' } });
        fireEvent.change(getPasswordInput(), { target: { value: 'pass' } });

        const submitBtn = getSubmitBtn();
        fireEvent.click(submitBtn);

        expect(screen.getByText(/LOADING|CARGANDO|YÜKLENİYOR/i)).toBeDefined();
        expect(submitBtn.disabled).toBe(true);

        resolveResponse({
            ok: true,
            headers: { get: () => 'Bearer token' },
            json: async () => ({ id: '123' }),
        });
    });
});