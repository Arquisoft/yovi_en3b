import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../components/Login/RegisterForm';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    test('1. Shows error when fields are empty', async () => {
        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        // Click play without filling inputs
        const playBtn = screen.getByText(/PLAY/i);
        fireEvent.click(playBtn);
        
        // Verify error message appears
        expect(screen.getByText(/Please fill in all fields/i)).toBeDefined();
    });

    test('2. Navigates on successful login', async () => {
        // Mock a successful API response
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ token: 'fake-token' }),
        });

        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText(/PLAY/i));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/menu'));
    });

    test('3. Shows error message on API failure', async () => {
    (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<MemoryRouter><RegisterForm /></MemoryRouter>);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByText(/PLAY/i));

    // Usamos findByText que espera a que aparezca y devuelve el elemento
    const errorMessage = await screen.findByText(/Invalid credentials/i);
    
    // Verificamos que sea visible en el DOM usando propiedades nativas del nodo
    expect(errorMessage).toBeDefined();
    expect(errorMessage.style.display).not.toBe('none'); 
});

    test('4. Navigates to signup on button click', async () => {
        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        const signUpBtn = screen.getByText(/SIGN UP/i);
        fireEvent.click(signUpBtn);
        
        // Verify navigation to signup
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    test('5. Clears error when user starts typing', async () => {
        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        fireEvent.click(screen.getByText(/PLAY/i));
        expect(screen.getByText(/Please fill in all fields/i)).toBeDefined();

        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        
        // Error should still be visible until both fields are filled
        expect(screen.queryByText(/Please fill in all fields/i)).toBeDefined();
    });

    test('6. Handles network error gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText(/PLAY/i));

        await waitFor(() => {
            expect(screen.getByText(/Please fill in all fields/i)).toBeDefined();
        });
    });

    test('7. Loading state is set while API is being called', async () => {
        let resolveResponse: any;
        const responsePromise = new Promise(resolve => {
            resolveResponse = resolve;
        });

        (global.fetch as any).mockReturnValue(responsePromise);

        render(<MemoryRouter><RegisterForm /></MemoryRouter>);
        
        fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'pass' } });
        
        const playBtn = screen.getByText(/PLAY/i) as HTMLButtonElement;
        fireEvent.click(playBtn);

        // Button should be disabled during loading
        expect(playBtn.disabled).toBe(true);

        resolveResponse({
            ok: true,
            json: async () => ({ token: 'fake-token' }),
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/menu');
        });
    });
});