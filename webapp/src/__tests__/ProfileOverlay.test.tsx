import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { useUserProfile } from '../components/UserProfile/useUserProfile';
import { changePassword } from '../components/UserProfile/userProfile.api';
import { toast } from 'sonner';

// --- MOCKS ---
const mockOnClose = vi.fn();
const mockNavigate = vi.fn();
const mockPlaySound = vi.fn();
const mockSave = vi.fn();
const mockResetDraft = vi.fn();
const mockSetDraftName = vi.fn();
const mockSetDraftAvatarId = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../components/UserProfile/useUserProfile', () => ({
    useUserProfile: vi.fn(),
}));

vi.mock('../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        neonMode: true,
        playSound: mockPlaySound,
    }),
}));

vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: {
                userProfile: 'Profile', displayName: 'Display Name', username: 'Username',
                ranking: 'Rank', chooseAvatar: 'Avatar', security: 'Security',
                currentPassword: 'Current', newPassword: 'New', confirmNew: 'Confirm',
            },
            buttons: {
                changePassword: 'Change Password', cancel: 'Cancel', confirm: 'Confirm',
                accessGameHistory: 'History', reset: 'Reset', save: 'Save'
            },
            messages: {
                loading: 'Loading...', usernameMustBeCompleted: 'Error Name',
                passwordChangedSuccess: 'Success!', errorChangingPassword: 'API Error',
                passwordsDoNotMatch: 'Mismatch'
            },
            validation: { chars8: '8+', uppercase: 'ABC', number: '123', special: '@' }
        },
    }),
}));

vi.mock('../components/UserProfile/userProfile.api', () => ({
    changePassword: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

const renderComponent = (open = true) => {
    return render(
        <MemoryRouter>
            <ProfileOverlay open={open} onClose={mockOnClose} />
        </MemoryRouter>
    );
};

describe('ProfileOverlay High Coverage Boost', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Estado por defecto (Cargado)
        vi.mocked(useUserProfile).mockReturnValue({
            profile: { username: 'test_user', displayName: 'Test Player' },
            ranking: { position: 1, totalPlayers: 10 },
            loading: false, error: null, draftName: 'Test Player',
            setDraftName: mockSetDraftName, draftAvatarId: 'avatar_01',
            setDraftAvatarId: mockSetDraftAvatarId, dirty: false,
            save: mockSave, resetDraft: mockResetDraft,
        } as any);
    });

    test('1. Renders loading and error states (Branch Coverage)', async () => {
        // Forzamos el estado de carga pero incluyendo los valores mínimos para que no explote el .trim()
        vi.mocked(useUserProfile).mockReturnValue({
            loading: true,
            profile: null,
            ranking: null,
            error: null,
            draftName: '', // Evita el error de .trim()
            draftAvatarId: 'avatar_01',
            dirty: false,
        } as any);

        const { rerender } = renderComponent();
        
        // Buscamos el texto de carga. Si usas un spinner, cámbialo por el texto que aparezca en pantalla
        const loadingElements = screen.getAllByText(/loading/i); // Usamos getAll por si aparece en varios sitios
        expect(loadingElements.length).toBeGreaterThan(0);

        // Caso: Error de carga
        vi.mocked(useUserProfile).mockReturnValue({
            loading: false,
            error: 'Fatal Error',
            profile: null,
            draftName: '',
            draftAvatarId: 'avatar_01',
            dirty: false,
        } as any);

        rerender(
            <MemoryRouter>
                <ProfileOverlay open={true} onClose={mockOnClose} />
            </MemoryRouter>
        );

        expect(screen.getByText('Fatal Error')).toBeInTheDocument();
    });

    test('2. Successful password change flow', async () => {
        vi.mocked(changePassword).mockResolvedValueOnce(undefined);
        renderComponent();
        
        await userEvent.click(screen.getByText('Change Password'));
        
        fireEvent.change(screen.getByPlaceholderText('Current'), {
            target: { value: 'oldPass123!' },
        });
        fireEvent.change(screen.getByPlaceholderText('New'), {
            target: { value: 'NewPass123!' },
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm'), {
            target: { value: 'NewPass123!' },
        });

        const confirmBtn = screen.getByText('Confirm');
        expect(confirmBtn).not.toBeDisabled();
        await userEvent.click(confirmBtn);

        await waitFor(() => {
            expect(changePassword).toHaveBeenCalledWith('oldPass123!', 'NewPass123!');
            expect(toast.success).toHaveBeenCalledWith('Success!');
        });
    });

    test('3. Catch block: Password change API error', async () => {
        vi.mocked(changePassword).mockRejectedValueOnce(new Error('Fail'));
        renderComponent();
        
        await userEvent.click(screen.getByText('Change Password'));
        fireEvent.change(screen.getByPlaceholderText('Current'), {
            target: { value: 'a' },
        });
        fireEvent.change(screen.getByPlaceholderText('New'), {
            target: { value: 'ValidPass1!' },
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm'), {
            target: { value: 'ValidPass1!' },
        });

        await userEvent.click(screen.getByText('Confirm'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('API Error');
        });
    });

    test('4. Keyboard: Escape key to cancel editing', async () => {
        renderComponent();
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) await userEvent.click(editBtn);

        const input = screen.getByDisplayValue('Test Player');
        fireEvent.keyDown(input, { key: 'Escape' });
        
        expect(mockPlaySound).toHaveBeenCalledWith('click.mp3');
    });

    test('5. Close button interaction when not editing', async () => {
        renderComponent();
        const closeBtn = document.querySelector('.profile-close-btn');
        if (closeBtn) await userEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockPlaySound).toHaveBeenCalledWith('click.mp3');
    });

    test('6. Reset and Save buttons when dirty', async () => {
        vi.mocked(useUserProfile).mockReturnValue({
            profile: { username: 'user', displayName: 'Name' },
            dirty: true, // Habilitar botones
            draftName: 'Name',
            draftAvatarId: 'avatar_01',
            resetDraft: mockResetDraft,
            save: mockSave,
            loading: false,
            error: null,
            setDraftName: vi.fn(),
            setDraftAvatarId: vi.fn()
        } as any);

        renderComponent();
        await userEvent.click(screen.getByText('Reset'));
        expect(mockResetDraft).toHaveBeenCalled();
        
        await userEvent.click(screen.getByText('Save'));
        expect(mockSave).toHaveBeenCalled();
    });
});
