import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import SignUpForm from '../components/SignUp/SignUpForm';
import { SettingsProvider } from '../context/SettingsContext';
import { I18nProvider } from '../i18n/Provider';

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

global.fetch = vi.fn();

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

const getNicknameInput = () => document.querySelector('input[name="nickname"]') as HTMLInputElement;
const getUsernameInput = () => document.querySelector('input[name="username"]') as HTMLInputElement;
const getEmailInput    = () => document.querySelector('input[name="email"]')    as HTMLInputElement;
const getPasswordInput = () => document.querySelector('input[name="password"]') as HTMLInputElement;
const getSubmitBtn     = () => document.querySelector('button[type="submit"]')  as HTMLButtonElement;

describe('SignUpForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('1. Renders all input fields and avatars', () => {
        renderWithProviders(<SignUpForm />);

        expect(getNicknameInput()).not.toBeNull();
        expect(getUsernameInput()).not.toBeNull();
        expect(getEmailInput()).not.toBeNull();
        expect(getPasswordInput()).not.toBeNull();
        expect(getSubmitBtn()).not.toBeNull();

        const avatars = screen.getAllByRole('button').filter(btn =>
            ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"].includes(btn.textContent || "")
        );
        expect(avatars.length).toBe(6);
    });

    test('2. Toggles password visibility', () => {
        renderWithProviders(<SignUpForm />);
        const passInput = getPasswordInput();
        const toggleBtn = document.querySelector('.eye-btn') as HTMLButtonElement;

        expect(passInput.type).toBe('password');

        fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('text');

        fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('password');
    });

    test('3. Updates validation UI as user types password', () => {
        renderWithProviders(<SignUpForm />);

        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Password123!' } });

        const validItems = document.querySelectorAll('.val-item.valid');
        expect(validItems.length).toBe(4);
    });

    test('4. Successfully creates account and navigates', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User created' }),
        });

        renderWithProviders(<SignUpForm />);

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'john@test.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(getSubmitBtn());

        await waitFor(() => {
            const btn = getSubmitBtn();
            expect(
                btn.textContent === 'CREANDO...' ||
                btn.textContent === 'CREATING...' ||
                btn.textContent === 'OLUŞTURULUYOR...'
            ).toBe(true);
        });

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

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'b' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'c@d.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(getSubmitBtn());

        const errorMsg = await screen.findByText(/Email already exists/i);
        expect(errorMsg).toBeDefined();
    });

    test('6. Handles server connection error', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        renderWithProviders(<SignUpForm />);

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'b' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'c@d.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(getSubmitBtn());

        const errorMsg = await screen.findByText(
            /Cannot connect to the server|No se puede conectar con el servidor|Sunucuya bağlanılamıyor/i
        );
        expect(errorMsg).toBeDefined();
    });

    test('7. Disables submit button when password is invalid', () => {
        renderWithProviders(<SignUpForm />);

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'john@test.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'short' } });

        expect(getSubmitBtn().disabled).toBe(true);
    });
});