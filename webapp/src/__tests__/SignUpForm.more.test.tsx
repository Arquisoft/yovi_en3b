import { describe, expect, test, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '../i18n/Provider';
import SignUpForm from '../components/SignUp/SignUpForm';

const mockNavigate = vi.fn();
const mockPlaySound = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/SettingsContext', () => ({
    useSettings: () => ({
        playSound: mockPlaySound,
        startBackgroundMusic: vi.fn(),
    }),
    SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <I18nProvider>
            {ui}
        </I18nProvider>
    );
};

describe('SignUpForm extra coverage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('shows error when API returns non-ok response', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: 'User exists' }),
        } as Response);

        renderWithProviders(<SignUpForm />);

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'Nick' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'user' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'a@b.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Password1!' } });

        fireEvent.click(getSubmitBtn());

        expect(await screen.findByText(/User exists/i)).toBeDefined();
    }, 10000);

    test('navigates on successful signup', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as Response);

        renderWithProviders(<SignUpForm />);

        fireEvent.change(getNicknameInput(), { target: { name: 'nickname', value: 'Nick' } });
        fireEvent.change(getUsernameInput(), { target: { name: 'username', value: 'user' } });
        fireEvent.change(getEmailInput(),    { target: { name: 'email',    value: 'a@b.com' } });
        fireEvent.change(getPasswordInput(), { target: { name: 'password', value: 'Password1!' } });

        fireEvent.click(getSubmitBtn());

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/menu');
        });
    }, 10000);
});