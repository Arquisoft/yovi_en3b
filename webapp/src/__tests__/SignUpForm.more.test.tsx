
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '../components/SignUp/SignUpForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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

    render(<SignUpForm />);

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

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/NICKNAME/i), 'Nick');
    await user.type(screen.getByLabelText(/USERNAME/i), 'user');
    await user.type(screen.getByLabelText(/EMAIL/i), 'a@b.com');
    await user.type(screen.getByLabelText(/PASSWORD/i), 'Password1!');

    await user.click(screen.getByRole('button', { name: /save account/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
