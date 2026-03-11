import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import HowToPlay from '../components/HowToPlay/HowToPlay'; 

describe('HowToPlay Component', () => {
    const mockOnClose = vi.fn(); 

    beforeEach(() => {
        vi.clearAllMocks(); 
    });

    test('1. Renders all main instructions and title', () => {
        render(<HowToPlay onClose={mockOnClose} />);
        
        // Verify the main title is present
        expect(screen.getByText(/HOW TO PLAY/i)).toBeDefined();

        // Verify that the 3 steps exist
        expect(screen.getByText(/The Choice/i)).toBeDefined();
        expect(screen.getByText(/Connection/i)).toBeDefined();
        expect(screen.getByText(/The "Y" Goal/i)).toBeDefined();
    });

    test('2. Contains the tutorial video link with correct attributes', () => {
        render(<HowToPlay onClose={mockOnClose} />);
        
        const videoLink = screen.getByRole('link', { name: /Watch Gameplay & Tutorial/i });
        
        // Verify URL of YouTube
        expect(videoLink.getAttribute('href')).toBe('https://youtu.be/eDGei98yBtY');
        
        // Important for security and SEO: target _blank requires rel noopener
        expect(videoLink.getAttribute('target')).toBe('_blank');
        expect(videoLink.getAttribute('rel')).toContain('noopener');
    });

    test('3. Calls onClose when clicking the "X" button', () => {
        render(<HowToPlay onClose={mockOnClose} />);
        
        const closeBtn = screen.getByText('×'); 
        fireEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('4. Calls onClose when clicking the "UNDERSTOOD" button', () => {
        render(<HowToPlay onClose={mockOnClose} />);
        
        const understoodBtn = screen.getByText(/UNDERSTOOD/i);
        fireEvent.click(understoodBtn);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('5. Renders the visual board representation', () => {
        const { container } = render(<HowToPlay onClose={mockOnClose} />);
        
        // Verify that the ball rows exist (visual representation)
        const rows = container.querySelectorAll('.balls-row');
        expect(rows.length).toBe(3);

        // Verify that red and blue balls exist
        const redBalls = container.querySelectorAll('.ball.red');
        const blueBalls = container.querySelectorAll('.ball.blue');
        
        expect(redBalls.length).toBeGreaterThan(0);
        expect(blueBalls.length).toBeGreaterThan(0);
    });
});