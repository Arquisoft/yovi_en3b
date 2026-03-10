import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

const mockOnClose = vi.fn();

// Complete dictionary for the component to avoid undefined errors
vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: { 
                userProfile: 'Profile', 
                displayName: 'Name', 
                username: 'User', 
                ranking: 'Rank', 
                chooseAvatar: 'Avatar', 
                security: 'Security',
                currentPassword: 'Current',
                newPassword: 'New',
                confirmNew: 'Confirm',
                uniqueIdCannotBeChanged: 'Fixed'
            },
            profile: { edit: 'Edit', save: 'Save' },
            messages: { loading: 'Loading...' },
            buttons: { 
                changePassword: 'Change Password', 
                cancel: 'Cancel', 
                confirm: 'Confirm',
                accessGameHistory: 'History',
                reset: 'Reset',
                save: 'Save'
            },
            errors: { generic: 'Error' }
        },
    }),
}));

describe('ProfileOverlay', () => {
    beforeEach(() => vi.clearAllMocks());
    afterEach(() => vi.restoreAllMocks());

    test('1. Loads and displays basic user information', async () => {
        render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
        
        // Ensure the loading state is finished
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));
        
        // Check if Profile title is visible
        expect(screen.getByText(/Profile/i)).toBeInTheDocument();
        // Verify unique ID/Ranking text is present
        expect(screen.getByText(/Rank/i)).toBeInTheDocument();
    });

    test('2. Allows editing the username', async () => {
        render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        const editBtn = document.querySelector('.edit-btn') as HTMLButtonElement;
        const user = userEvent.setup();
        
        await user.click(editBtn);
        const input = screen.getByRole('textbox');
        
        // Verify input is enabled after click
        expect(input).not.toBeDisabled();
    });

    test('3. Prevents closing when in edit mode', async () => {
        render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        // Enter edit mode
        const editBtn = document.querySelector('.edit-btn') as HTMLButtonElement;
        await userEvent.click(editBtn);

        // Try to click close button (X)
        const closeBtn = document.querySelector('.close-modal') as HTMLButtonElement;
        expect(closeBtn).toBeDisabled();
    });

    test('4. Allows selecting an avatar', async () => {
        render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        const avatars = screen.getAllByRole('button', { name: /🧩|🎮|🚀|🏆|🦊|🐙/ });
        const user = userEvent.setup();
        
        // Click on the second avatar (🎮)
        await user.click(avatars[1]);
        expect(avatars[1]).toHaveClass('active');
    });

    test('5. Handles password change section', async () => {
        render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

        const passTrigger = screen.getByText(/Change Password/i);
        await userEvent.click(passTrigger);

        // Verify password inputs appear
        expect(screen.getByPlaceholderText(/Current/i)).toBeInTheDocument();
    });


test('6. Toggles password fields correctly', async () => {
    render(<MemoryRouter><ProfileOverlay open={true} onClose={mockOnClose} /></MemoryRouter>);
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading.../i));

    const changePassBtn = screen.getByText(/Change Password/i);
    await userEvent.click(changePassBtn);

    // Verify the inputs appear (covering the logic branch)
    expect(screen.getByPlaceholderText(/Current/i)).toBeInTheDocument();
});
    
});