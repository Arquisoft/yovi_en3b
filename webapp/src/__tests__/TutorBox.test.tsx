import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TutorBot from '../components/TutorBox/TutorBox'; 
import '@testing-library/jest-dom';

describe('TutorBot Component', () => {
    const mockOnClear = vi.fn();

    test('renders nothing when there is no message and it is closed', () => {
        const { container } = render(<TutorBot message={null} onClear={mockOnClear} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders the robot icon when a message is provided', () => {
        render(<TutorBot message="Test Tip" onClear={mockOnClear} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('shows notification badge when message arrives and is closed', () => {
        render(<TutorBot message="New Tip" onClear={mockOnClear} />);
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('opens the bubble and clears notification on click', () => {
        render(<TutorBot message="Learning React" onClear={mockOnClear} />);
        const robotButton = screen.getByRole('button');
        fireEvent.click(robotButton);
        expect(screen.getByText('Learning React')).toBeInTheDocument();
        expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    test('calls onClear and closes when clicking the X button', () => {
        const { container } = render(<TutorBot message="Exit Tip" onClear={mockOnClear} />);
        
        const robotButton = screen.getByRole('button');
        fireEvent.click(robotButton);

        const closeButton = container.querySelector('.close-tutor');
        if (closeButton) {
            fireEvent.click(closeButton);
        }

        expect(mockOnClear).toHaveBeenCalled();
    });

    test('toggles bubble with keyboard Enter key', () => {
        render(<TutorBot message="Keyboard Test" onClear={mockOnClear} />);
        const robotButton = screen.getByRole('button');
        
        fireEvent.keyDown(robotButton, { key: 'Enter' });
        expect(screen.getByText('Keyboard Test')).toBeInTheDocument();
        
        fireEvent.keyDown(robotButton, { key: 'Enter' });
        expect(mockOnClear).toHaveBeenCalled();
    });

    test('updates notification when message changes', () => {
        const { rerender } = render(<TutorBot message={null} onClear={mockOnClear} />);
        rerender(<TutorBot message="Update" onClear={mockOnClear} />);
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});