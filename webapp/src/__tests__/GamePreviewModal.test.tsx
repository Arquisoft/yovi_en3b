import { render, screen, fireEvent } from '@testing-library/react';
import GamePreviewModal from '../components/GamePreviewModal/GamePreviewModal';
import { SettingsProvider } from '../context/SettingsContext';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

/**
 * Wraps the component in the necessary Context Providers.
 * Consistent with the blueprint provided in GameScreen tests.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <SettingsProvider>
            {ui}
        </SettingsProvider>
    );
};

/**
 * Global mock for the Web Audio API.
 * JSDOM does not support audio playback, so we stub it to prevent errors.
 */
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        load: vi.fn(),
    };
}));

/**
 * Mocking 'useI18n' hook to provide static strings for the tests.
 */
vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: {
                preview: 'Game Preview',
                timeLimit: 'Time Limit',
                noLimit: 'No Limit',
                minutesShort: 'min',
                opponent: 'Opponent',
                difficulty: 'Difficulty',
                boardSize: 'Board Size',
            },
            buttons: {
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard',
                playNow: 'Play Now',
            },
        },
    }),
}));

describe('GamePreviewModal', () => {
    const mockOnClose = vi.fn();
    const mockOnStart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks(); // Reset all call counts before each test
    });

    test('TEST 1: does not render when isOpen is false', () => {
        const { container } = renderWithProviders(
            <GamePreviewModal isOpen={false} onClose={mockOnClose} onStart={mockOnStart} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('TEST 2: renders correctly when isOpen is true', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        expect(screen.getByText('Game Preview')).toBeInTheDocument();
        expect(screen.getByText(/Time Limit/i)).toBeInTheDocument();
    });

    test('TEST 3: changes bot selection when clicked', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        // Buttons are identifiable by the bot-btn class and their order
        const botButtons = document.querySelectorAll('.bot-btn');
        
        fireEvent.click(botButtons[1]); // Click the second bot (CPU)
        expect(botButtons[1]).toHaveClass('active');
        expect(botButtons[0]).not.toHaveClass('active');
    });

    test('TEST 4: updates difficulty and time limit label via slider', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const slider = screen.getByRole('slider');
        
        // Change to "Hard" (value 2)
        fireEvent.change(slider, { target: { value: '2' } });
        expect(slider).toHaveValue('2');
        
        // Verify that the hard label becomes active
        expect(screen.getByText('Hard')).toHaveClass('active');
    });

    test('TEST 5: board size stepper increases and decreases values', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const plusBtn = screen.getByText('+');
        const minusBtn = screen.getByText('-');
        const valueDisplay = document.querySelector('.stepper-value');

        // Initial size is 5
        fireEvent.click(plusBtn);
        expect(valueDisplay?.textContent).toBe('6');

        fireEvent.click(minusBtn);
        expect(valueDisplay?.textContent).toBe('5');
    });

    test('TEST 6: calls onStart with correct settings data', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const playBtn = screen.getByText('Play Now');
        fireEvent.click(playBtn);
        
        // Verify onStart was called with the default object
        expect(mockOnStart).toHaveBeenCalledWith(expect.objectContaining({
            size: 5,
            difficulty: 1,
            botType: 'robot'
        }));
    });

    test('TEST 7: closes modal when X button is clicked', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const closeBtn = screen.getByText('×');
        fireEvent.click(closeBtn);
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('TEST 8: clicking the overlay calls onClose', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const overlay = document.querySelector('.preview-modal-overlay');
        if (overlay) fireEvent.click(overlay);
        
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('TEST 9: clicking inside the modal content does NOT call onClose', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const content = document.querySelector('.preview-modal-content');
        if (content) fireEvent.click(content);
        
        // stopPropagation should prevent onClose from being called
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('TEST 10: difficulty 0 shows "No Limit" time format', () => {
        renderWithProviders(
            <GamePreviewModal isOpen={true} onClose={mockOnClose} onStart={mockOnStart} />
        );
        
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '0' } }); // Easy mode
        
        expect(screen.getByText(/No Limit/i)).toBeInTheDocument();
    });
});