import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../components/Login/RegisterForm';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';

// 1. Mock navigate from react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows validation error when fields are empty', async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    // Find and click the PLAY button
    await user.click(screen.getByRole('button', { name: /play/i }));

    // Assert the specific error message from your component appears
    expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
    
    // Ensure we did not try to navigate or fetch
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('submits credentials, calls fetch, and navigates to /menu', async () => {
    const user = userEvent.setup();

    // Mock fetch to resolve successfully
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<RegisterForm />);

    // Target the inputs using their placeholders
    const usernameInput = screen.getByPlaceholderText('Enter your name');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    // Type in the credentials
    await user.type(usernameInput, 'Pablo');
    await user.type(passwordInput, 'SecurePass123');

    // Click the PLAY button
    await user.click(screen.getByRole('button', { name: /play/i }));

    // 1. Wait for fetch to be called with the correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/createuser'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'Pablo', password: 'SecurePass123' }),
        })
      );
    });

    // 2. Assert that the component navigated to the menu!
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });

  // BONUS TEST: Since you have a SIGN UP button, let's test that it navigates properly!
  test('navigates to /signup when SIGN UP button is clicked', async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    // Click the "SIGN UP" button
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Assert it navigated to the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });
});