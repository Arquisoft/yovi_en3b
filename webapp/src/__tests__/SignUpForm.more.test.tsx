
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '../components/SignUp/SignUpForm';
import { SettingsProvider } from '../context/SettingsContext';

const mockNavigate = vi.fn();

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <SettingsProvider>
        {ui}
      </SettingsProvider>
    );
  };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'User exists' }),
    } as Response);

    renderWithProviders(<SignUpForm />);

    await user.type(screen.getByLabelText(/NICKNAME/i), 'Nick');
    await user.type(screen.getByLabelText(/USERNAME/i), 'user');
    await user.type(screen.getByLabelText(/EMAIL/i), 'a@b.com');
    await user.type(screen.getByLabelText(/PASSWORD/i), 'Password1!');

    await user.click(screen.getByRole('button', { name: /save account/i }));

    expect(await screen.findByText(/User exists/i)).toBeDefined();
  });

  test('navigates on successful signup', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderWithProviders(<SignUpForm />);

    await user.type(screen.getByLabelText(/NICKNAME/i), 'Nick');
    await user.type(screen.getByLabelText(/USERNAME/i), 'user');
    await user.type(screen.getByLabelText(/EMAIL/i), 'a@b.com');
    await user.type(screen.getByLabelText(/PASSWORD/i), 'Password1!');

    await user.click(screen.getByRole('button', { name: /save account/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
