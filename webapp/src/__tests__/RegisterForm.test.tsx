import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../components/Login/RegisterForm';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';

// 1. Create a mock function for navigate
const mockNavigate = vi.fn();

// 2. Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('RegisterForm', () => {
  // Clear the mock navigator between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows validation error when username is empty', async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    // 1. Do the action (do NOT put this inside waitFor)
    await user.click(screen.getByRole('button', { name: /lets go!/i }));

    // 2. Assert the result (findByText automatically waits for the element to appear)
    expect(await screen.findByText(/please enter a username/i)).toBeInTheDocument();
  });

  test('submits username and displays response', async () => {
    const user = userEvent.setup();

    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Hello Pablo' }),
    } as Response);

    render(<RegisterForm />);

    // 1. Do the actions first
    await user.type(screen.getByLabelText(/whats your name\?/i), 'Pablo');
    await user.click(screen.getByRole('button', { name: /lets go!/i }));

    // 2. Wait for the async state to update and assert
    // (I uncommented your expectation here because it should work perfectly now!)
    await waitFor(() => {
      expect(screen.getByText(/hello pablo/i)).toBeInTheDocument();
    });
    
    // Optional: You can also assert that fetch was called correctly
    // expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});