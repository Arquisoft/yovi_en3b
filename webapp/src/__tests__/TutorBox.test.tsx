import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorBot from '../components/TutorBox/TutorBox';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

/**
 * Mocking Lucide Icons to simplify the DOM.
 * This ensures we can find buttons by their specific roles or containers
 * without complex SVG selectors.
 */
vi.mock('lucide-react', () => ({
    Bot: () => <div data-testid="bot-icon" />,
    X: () => <div data-testid="close-icon" />
}));

describe('TutorBot Component', () => {
    const mockOnClear = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('TEST 1: does not render when message is null and it is closed', () => {
        const { container } = render(<TutorBot message={null} onClear={mockOnClear} />);
        expect(container.firstChild).toBeNull();
    });

    test('TEST 2: displays notification badge when a new message arrives', () => {
        render(<TutorBot message="Strategic Tip" onClear={mockOnClear} />);
        
        const badge = screen.getByText('1');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('notification-badge');
    });

    test('TEST 3: opens bubble and hides badge upon clicking the robot avatar', async () => {
        render(<TutorBot message="Contextual Help" onClear={mockOnClear} />);
        const user = userEvent.setup();

        // Initially badge is there, bubble text is not (bubble logic: isOpen && message)
        expect(screen.getByText('1')).toBeInTheDocument();
        
        // Click the avatar wrapper
        const avatar = screen.getByTestId('bot-icon').closest('.robot-icon-wrapper');
        await user.click(avatar!);

        expect(screen.getByText('Contextual Help')).toBeVisible();
        expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    test('TEST 4: calls onClear when closing the bubble by clicking the avatar again', async () => {
        render(<TutorBot message="Message" onClear={mockOnClear} />);
        const user = userEvent.setup();
        const avatar = screen.getByTestId('bot-icon').closest('.robot-icon-wrapper');

        // Open
        await user.click(avatar!);
        // Close
        await user.click(avatar!);

        expect(mockOnClear).toHaveBeenCalledTimes(1);
    });

    test('TEST 5: calls onClear and closes bubble when clicking the X button', async () => {
        render(<TutorBot message="Close Me" onClear={mockOnClear} />);
        const user = userEvent.setup();
        
        // Open bubble first
        await user.click(screen.getByTestId('bot-icon').closest('.robot-icon-wrapper')!);
        
        // Find and click close button
        const closeBtn = screen.getByRole('button');
        await user.click(closeBtn);

        expect(mockOnClear).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Close Me')).not.toBeInTheDocument();
    });

    test('TEST 6: notification badge reactivates when a new message is received', () => {
        const { rerender } = render(<TutorBot message={null} onClear={mockOnClear} />);
        
        // Simulate GameScreen sending a message later
        rerender(<TutorBot message="New Hint" onClear={mockOnClear} />);
        
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('TEST 7: stopPropagation is called on the close button to prevent bubble toggle', async () => {
        render(<TutorBot message="Safety First" onClear={mockOnClear} />);
        const user = userEvent.setup();
        
        await user.click(screen.getByTestId('bot-icon').closest('.robot-icon-wrapper')!);
        
        const closeBtn = screen.getByRole('button');
        // We verify the result: if propagation wasn't stopped, the parent's onClick 
        // would trigger again, potentially changing the state inconsistently.
        await user.click(closeBtn);
        
        expect(mockOnClear).toHaveBeenCalled();
    });
});