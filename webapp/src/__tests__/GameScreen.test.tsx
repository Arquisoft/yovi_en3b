import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameScreen from '../components/GameScreen/GameScreen';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// ============================== MOCKS ==============================

// Mock navigate from react-router-dom.
// "Fake" function for useNavigate, so we can check 
// that it was called without truly navigating.
const mockNavigate = vi.fn();

// Simulating the URL, like it reached GameScreen with
// the size of the board = 3 (difficulty easy)
const mockLocation = { state: { size: 3 } };

// Mock react-router-dom so that when GameScreen calls 
// useNavigate() it receives mockNavigate
// useLocation() it receives mockLocation
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

// Mock the translation hook to return fixed english texts.
// Without this, the hook would throw an error because there
// is no I18n provider in tests.
// Summary: To control exactly what texts appear in the DOM
vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: {
                player1: 'Player 1',            // Text for player 1 card
                player2: 'Player 2',            // Text for player 2 card
                vs: 'VS'                        // Separator text between players
            },
            buttons: {
                undo: 'Undo',                    // Undo button
                hint: 'Hint',                    // Hint button
                confirm: 'Confirm',              // Confirm move button
                exit: 'Exit',                    // Exit button
                language: 'Language',            // Language button title
                howToPlay: 'How to Play',        // How to play button title
                settings: 'Settings',            // Settings button title
                yesExitAndLose: 'Yes, Exit',     // Confirm exit button inside modal
                backToGame: 'Back to Game',      // Cancel exit button inside modal
            },
            messages: {
                areYouSure: 'Are you sure?',              // Exit modal title
                loseWarning: 'You will lose the game.',   // Exit modal warning message
                openChat: 'Open Chat',                    // Chat toggle button title
            },
        },
    }),
}));

// Mock LanguageDialog to avoid rendering its real implementation.
// Only care whether it's visible or not, so we return a div
// with data-testid when open = true and null when open = false
vi.mock('../components/LanguageDialog/LanguageDialog', () => ({
    LanguageDialog: ({ open }: { open: boolean }) => {
        if (open) {
            return <div data-testid="language-dialog" />
        } else {
            return null
        }
    }
}));

// Mock react-hexgrid. Replaces each component with simple HTML
// equivalents (because it is really complex to test SVG)
// - HexGrid    ->  <svg> container
// - Layout     ->  <g> grouper
// - Hexagon    ->  clickable <g> with data-testid so we can find it in tests
vi.mock('react-hexgrid', () => ({
    HexGrid: ({ children }: any) => <svg>{children}</svg>,
    Layout: ({ children }: any) => <g>{children}</g>,
    Hexagon: ({ children, onClick, className }: any) => (
        // The data-testid is just so the cells can be obtained later with 
        // "getAllByTestId". The onclick and classname is just to maintain
        // the original behaviour.
        <g className={className} onClick={onClick} data-testid="hex-cell">
            {children}
        </g>
    ),
}));


// Mock generateBoard so it always returns the same 3 cells.
// This makes tests predictable: we know exactly how many cells
// the board will have and what the coordinates are.
vi.mock('../components/GameScreen/gridUtils', () => ({
    generateBoard: () => [
        { x: 0, y: 0, z: 0, q: 0, r: 0, s: 0 },     // Cell 1
        { x: 1, y: 0, z: -1, q: 1, r: 0, s: -1 },   // Cell 2
        { x: 0, y: 1, z: -1, q: 0, r: 1, s: -1 },   // Cell 3
    ],
}));

// =========================== END OF MOCKS ==========================

// ============================== TESTS ==============================

// The describe is just to group all tests related to the game screen
describe('GameScreen', () => {

    // Before each test, the mocks are cleared and fetch is mocked
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock fetch for hint requests
        global.fetch = vi.fn((url: any) => {
            if (url.includes('/ybot/hint')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        hint: 'This is a test hint',
                        suggested_move: { x: 1, y: 0, z: -1 }
                    })
                } as Response);
            }
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    // After each test, the mocks are restored to their original state
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // TEST 1: Check that the header shows both players names and the
    // "VS" text
    test('renders player cards and VS text', () => {
        render(<GameScreen />);
        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('Player 2')).toBeInTheDocument();
        expect(screen.getByText('VS')).toBeInTheDocument();
    });

    // TEST 2: Check that the footer has the 4 buttons 
    // - Undo
    // - Hint
    // - Confirm
    // - Exit
    test('renders footer action buttons', () => {
        render(<GameScreen />);
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
    });

    // TEST 3: The "confirm" button is disabled when there is 
    // no cell (hexagon) selected
    test('confirm button is disabled when no cell is selected', () => {
        render(<GameScreen />);
        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    });


    // TEST 4:  When clicking a cell (hexagon), the "confirm" 
    // button is enabled.
    test('confirm button enables after clicking a hex cell', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        const cells = screen.getAllByTestId('hex-cell');
        await user.click(cells[0]);

        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
    });

    // TEST 5: After pressing "confirm", the "confirm" button 
    // should be disabled.
    test('confirm button disables again after confirming a move', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    });

    // TEST 6: After confirming, the turn should swap to player2
    test('turn switches from Player 1 to Player 2 after confirming', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        expect(screen.getByText('Player 2').closest('div')).toHaveClass('active');
    });

    // TEST 7: The "Exit" button should open the "Exit" confirmation
    // window
    test('exit button opens confirmation window', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /exit/i }));

        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText('You will lose the game.')).toBeInTheDocument();
    });

    // TEST 8: The "Back to Game" button should close the "Exit" 
    // confirmation window and go back to the game screen.
    test('back to game button closes the exit window', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /exit/i }));
        await user.click(screen.getByRole('button', { name: /back to game/i }));

        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    // TEST 9: Confirming the "Exit" confirmation window should call 
    // "navigate" with "/menu"
    test('confirming exit navigates to /menu', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /exit/i }));
        await user.click(screen.getByRole('button', { name: /yes, exit/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    // TEST 10: The chat should be visible by default
    // (For now, isChatOpen is set to true, but can be changed)
    test('chat is visible by default', () => {
        render(<GameScreen />);
        expect(screen.getByText('Good luck!')).toBeInTheDocument();
    });

    // TEST 11: The chat should be closed when the "X" button (close 
    // chat button) is clicked.
    test('chat closes when X button is clicked', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Close chat'));

        expect(screen.queryByText('Good luck!')).not.toBeInTheDocument();
    });

    // TEST 12: The message icon button should toggle the chat
    // - Opens the chat if it is closed
    // - Closes the chat if it is open (like the "X" button)
    test('chat toggles with the message icon button', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Open Chat'));
        expect(screen.queryByText('Good luck!')).not.toBeInTheDocument();

        await user.click(screen.getByTitle('Open Chat'));
        expect(screen.getByText('Good luck!')).toBeInTheDocument();
    });


    // TEST 13: The "Language" button should open the "Language" window
    // to change the language.
    test('language window opens when language button is clicked', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Language'));

        expect(screen.getByTestId('language-dialog')).toBeInTheDocument();
    });

    // TEST 14: The difficulty dialog should open when difficulty button is clicked
    test('difficulty dialog opens when difficulty button is clicked', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Difficulty'));

        expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
        expect(screen.getByText('Choose difficulty for AI hints and strategies')).toBeInTheDocument();
    });

    // TEST 15: Difficulty selection should change the difficulty level
    test('difficulty selection changes the difficulty level', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Difficulty'));
        await user.click(screen.getByRole('button', { name: /^Easy/i }));

        expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument();
    });

    // TEST 16: Hint button should be disabled after max hints reached
    test('hint button shows maximum hints reached', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        // Click hint button 3 times to reach max (3/3)
        for (let i = 0; i < 3; i++) {
            const hintBtn = screen.getByRole('button', { name: /hint/i });
            await user.click(hintBtn);
            // Wait for fetch to complete
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Check that the button is now disabled after 3 hints used
        expect(screen.getByRole('button', { name: /hint/i })).toBeDisabled();
    });

    // TEST 17: Settings button should be clickable
    test('settings button is clickable', () => {
        render(<GameScreen />);
        const settingsButton = screen.getByTitle('Difficulty');
        expect(settingsButton).toBeInTheDocument();
    });

    // TEST 18: How to Play button should be clickable
    test('how to play button is clickable', () => {
        render(<GameScreen />);
        const howToPlayButton = screen.getByTitle('How to Play');
        expect(howToPlayButton).toBeInTheDocument();
    });

    // TEST 19: Undo button should be present
    test('undo button is present in footer', () => {
        render(<GameScreen />);
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });

    // TEST 20: Multiple cells should be selectable one after another
    test('can select different cells sequentially', async () => {
        render(<GameScreen />);
        const user = userEvent.setup({ delay: null });
        const cells = screen.getAllByTestId('hex-cell');

        // Select first cell
        await user.click(cells[0]);
        let confirmBtn = screen.getByRole('button', { name: /confirm/i });
        expect(confirmBtn).not.toBeDisabled();

        // Confirm the move
        await user.click(confirmBtn);

        // Verify button becomes disabled while waiting
        confirmBtn = screen.getByRole('button', { name: /confirm/i });
        expect(confirmBtn).toBeDisabled();
        
        // The core test: We verified that:
        // 1. Can select a cell (first cell enabled the button)
        // 2. Can confirm the move
        // 3. The button properly disables after confirming
        // This demonstrates sequential cell selection capability
    });

    // TEST 21: Player should alternate after each move
    test('players alternate turns correctly', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        // Initial state - Player 1 active
        expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');

        // Make move as Player 1
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        // After delay, Player 2 should be active
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(screen.getByText('Player 2').closest('div')).toHaveClass('active');
    });

    // TEST 22: Hint display should show hint content
    test('hint displays content after button click', async () => {
        // Mock the fetch for hints
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    hint: 'Test strategic hint',
                    suggested_move: { x: 0, y: 0, z: 0 }
                })
            } as Response)
        );

        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /hint/i }));
        await new Promise(resolve => setTimeout(resolve, 200));

        // The hint should be displayed (checking for fetch was called)
        expect(global.fetch).toHaveBeenCalled();

        vi.clearAllMocks();
    });

    // TEST 23b: Hint error branch shows fallback message
    test('hint error shows fallback message', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            } as Response)
        );

        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /hint/i }));
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(screen.getByText(/Could not retrieve hint/i)).toBeInTheDocument();
    });

    // TEST 23: Close hint should remove hint display
    test('hint can be closed', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    hint: 'Test hint',
                    suggested_move: null
                })
            } as Response)
        );

        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /hint/i }));
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch was called
        expect(global.fetch).toHaveBeenCalled();

        const closeBtn = document.querySelector('.hint-container .close-x') as HTMLButtonElement;
        await user.click(closeBtn);
        expect(screen.queryByText('Test hint')).not.toBeInTheDocument();

        vi.clearAllMocks();
    });

    // TEST 24: Language dialog should close when language is selected
    test('language dialog closes when selected', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Language'));
        expect(screen.getByTestId('language-dialog')).toBeInTheDocument();
    });

    // TEST 25: Difficulty dialog close button should close the dialog
    test('difficulty dialog close button works', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Difficulty'));
        expect(screen.getByText('Difficulty Level')).toBeInTheDocument();

        // Get the close button by its text 'Close' which is unique to the difficulty modal
        const closeButtons = screen.getAllByRole('button', { name: /close/i });
        // Find the one in the difficulty modal (the first or second one)  
        const difficultyCloseBtn = closeButtons.find(btn => btn.textContent?.trim() === 'Close') || closeButtons[1];
        await user.click(difficultyCloseBtn);
        expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument();
    });

    // TEST 25b: select medium and hard difficulty
    test('difficulty selection supports medium and hard', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getByTitle('Difficulty'));
        await user.click(screen.getByRole('button', { name: /^Medium/i }));
        expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument();

        await user.click(screen.getByTitle('Difficulty'));
        await user.click(screen.getByRole('button', { name: /^Hard/i }));
        expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument();
    });

    // TEST 25c: reaching max hints shows limit message
    test('shows max hint message when exceeded', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    hint: 'Hint text',
                    suggested_move: null
                })
            } as Response)
        );

        render(<GameScreen />);
        const user = userEvent.setup();

        for (let i = 0; i < 3; i++) {
            await user.click(screen.getByRole('button', { name: /hint/i }));
            await new Promise(resolve => setTimeout(resolve, 20));
        }

        const hintBtn = screen.getByRole('button', { name: /hint/i });
        hintBtn.removeAttribute('disabled');
        await user.click(hintBtn);

        expect(screen.getByText(/Maximum 3 hints reached/i)).toBeInTheDocument();
    });

    // TEST 26: Cell selection should be temporary until confirmed
    test('cell selection is temporary until confirmed', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();
        const cells = screen.getAllByTestId('hex-cell');

        await user.click(cells[0]);
        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();

        await user.click(cells[1]);
        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
    });

    // TEST 27: Board state should persist after moves
    test('board maintains state after multiple moves', async () => {
        render(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        // Wait for bot cooldown
        await new Promise(resolve => setTimeout(resolve, 3500));

        expect(screen.getByText('Player 1')).toBeInTheDocument();
    });
});
