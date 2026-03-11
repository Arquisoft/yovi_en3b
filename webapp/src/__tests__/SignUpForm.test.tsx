import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import SignUpForm from '../components/SignUp/SignUpForm';

// Mock de fetch global
global.fetch = vi.fn();

describe('SignUpForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('1. Renders all input fields and avatars', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        expect(screen.getByLabelText(/NICKNAME/i)).toBeDefined(); // Verify nickname label
        expect(screen.getByLabelText(/USERNAME/i)).toBeDefined(); // Verify username label
        expect(screen.getByLabelText(/EMAIL/i)).toBeDefined(); // Verify email label
        expect(screen.getByText(/SAVE ACCOUNT/i)).toBeDefined(); // Verify button exists
        
        const avatars = screen.getAllByRole('button').filter(btn => 
            ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"].includes(btn.textContent || "")
        );
        expect(avatars.length).toBe(6); // Ensure all 6 avatars are rendered
    });

    test('2. Toggles password visibility', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        const passInput = screen.getByLabelText(/PASSWORD/i) as HTMLInputElement;
        const toggleBtn = screen.getByRole('button', { name: '' }); // El botón del ojo

        expect(passInput.type).toBe('password'); // Initially hidden
        
        fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('text'); // Shown after click
        
        fireEvent.click(toggleBtn);
        expect(passInput.type).toBe('password'); // Hidden again
    });

    test('3. Updates validation UI as user types password', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        const passInput = screen.getByLabelText(/PASSWORD/i);

        // Type a password that only meets length and number
        fireEvent.change(passInput, { target: { name: 'password', value: 'Password123!' } });

        // Check if validation items have the "valid" status (clase CSS o icono Check)
        const validationItems = screen.getAllByText(/8\+ chars|Uppercase|Number|Special/i);
        validationItems.forEach(item => {
            expect(item.parentElement?.className).toContain('valid'); // All should be valid now
        });
    });

    test('4. Selects an avatar from the grid', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        const avatars = screen.getAllByRole('button').filter(btn => btn.textContent === "🚀");
        
        fireEvent.click(avatars[0]);
        
        // El avatar seleccionado aparece en la "bubble" principal
        const displayAvatar = screen.getByText("🚀", { selector: '.avatar-bubble' });
        expect(displayAvatar).toBeDefined(); // Rocket should be displayed
    });

    test('5. Successfully creates account and navigates', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User created' }),
        });

        render(<MemoryRouter><SignUpForm /></MemoryRouter>);

        // Fill form
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'john@test.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        const submitBtn = screen.getByText(/SAVE ACCOUNT/i);
        fireEvent.click(submitBtn);

        expect(screen.getByText(/CREATING.../i)).toBeDefined(); // Check loading state

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/createuser'), expect.any(Object));
        });
    });

    test('6. Shows error message on API failure', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Email already exists' }),
        });

        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        // Rellenar lo mínimo para habilitar el botón
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'b' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'c@d.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(screen.getByText(/SAVE ACCOUNT/i));

        const errorMsg = await screen.findByText(/Email already exists/i);
        expect(errorMsg).toBeDefined(); // Error should be visible
    });

    test('7. Handles server connection error (catch block)', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'a' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'b' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'c@d.com' } });
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'Valid123!' } });

        fireEvent.click(screen.getByText(/SAVE ACCOUNT/i));

        const errorMsg = await screen.findByText(/Cannot connect to the server/i);
        expect(errorMsg).toBeDefined(); // Catch block error should be visible
    });

    test('8. Disables submit button when password is invalid', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        fireEvent.change(screen.getByLabelText(/NICKNAME/i), { target: { name: 'nickname', value: 'John' } });
        fireEvent.change(screen.getByLabelText(/USERNAME/i), { target: { name: 'username', value: 'jdoe' } });
        fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { name: 'email', value: 'john@test.com' } });
        
        // Password missing uppercase
        fireEvent.change(screen.getByLabelText(/PASSWORD/i), { target: { name: 'password', value: 'short123!' } });

        const submitBtn = screen.getByText(/SAVE ACCOUNT/i) as HTMLButtonElement;
        expect(submitBtn.disabled).toBe(true);
    });

    test('9. Resets avatar selection correctly', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        const rocketAvatar = screen.getAllByRole('button').filter(btn => btn.textContent === "🚀")[0];
        
        // Select rocket avatar
        fireEvent.click(rocketAvatar);
        expect(rocketAvatar).toHaveClass('active');
        
        // Select different avatar to deselect rocket
        const pizzaAvatar = screen.getAllByRole('button').filter(btn => btn.textContent === "🎮")[0];
        fireEvent.click(pizzaAvatar);
        
        // Check that pizza is now active
        expect(pizzaAvatar).toHaveClass('active');
        expect(rocketAvatar).not.toHaveClass('active');
    });

    test('10. Updates all form fields on change', () => {
        render(<MemoryRouter><SignUpForm /></MemoryRouter>);
        
        const nicknameInput = screen.getByLabelText(/NICKNAME/i) as HTMLInputElement;
        const usernameInput = screen.getByLabelText(/USERNAME/i) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/EMAIL/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/PASSWORD/i) as HTMLInputElement;

        fireEvent.change(nicknameInput, { target: { name: 'nickname', value: 'TestNick' } });
        fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@email.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'TestPass123!' } });

        expect((nicknameInput).value).toBe('TestNick');
        expect((usernameInput).value).toBe('testuser');
        expect((emailInput).value).toBe('test@email.com');
        expect((passwordInput).value).toBe('TestPass123!');
    });
});