
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SignUpForm from '../components/SignUp/SignUpForm';

const mockNavigate = vi.fn();
const mockPlaySound = vi.fn();

const renderWithProviders = (ui: React.ReactElement) => {
    return render(ui);
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({
    playSound: mockPlaySound,
  }),
}));

/**
 * Global mock for the Web Audio API.
 * JSDOM (the test environment) does not support audio playback. 
 * This stub replaces the native 'Audio' constructor with a fake object 
 * to prevent "TypeError: Audio is not a constructor" or ".play() is undefined" errors.
 */
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

describe('SignUpForm extra coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows error when API returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'User exists' }),
    } as Response);

    renderWithProviders(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/NICKNAME/i), {
      target: { name: 'nickname', value: 'Nick' },
    });
    fireEvent.change(screen.getByLabelText(/USERNAME/i), {
      target: { name: 'username', value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/EMAIL/i), {
      target: { name: 'email', value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/PASSWORD/i), {
      target: { name: 'password', value: 'Password1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save account/i }));

    expect(await screen.findByText(/User exists/i)).toBeDefined();
  }, 10000);

  test('navigates on successful signup', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderWithProviders(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/NICKNAME/i), {
      target: { name: 'nickname', value: 'Nick' },
    });
    fireEvent.change(screen.getByLabelText(/USERNAME/i), {
      target: { name: 'username', value: 'user' },
    });
    fireEvent.change(screen.getByLabelText(/EMAIL/i), {
      target: { name: 'email', value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/PASSWORD/i), {
      target: { name: 'password', value: 'Password1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });
  }, 10000);
});
