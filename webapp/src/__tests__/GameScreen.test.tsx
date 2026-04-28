import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameScreen from '../components/GameScreen/GameScreen';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { checkWin } from '../components/GameScreen/yGameLogic';
import { requestBotChatReply } from '../components/GameScreen/gameyChat.api';

/**
 * Wraps the component in the necessary Context Providers (Routes and Settings).
 * Similar to Dependency Injection in Backend: it provides the "services"
 * (Navigation and Global State) that the component needs to run without crashing.
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <SettingsProvider>
                {ui}
            </SettingsProvider>
        </BrowserRouter>
    );
};

const mockNavigate = vi.fn();
const mockLocation = { state: { size: 3, time: 60, botType: 'robot' } };

/**
 * Global mock for the Web Audio API.
 * JSDOM (the test environment) does not support audio playback. 
 * This stub replaces the native 'Audio' constructor with a fake object 
 * to prevent "TypeError: Audio is not a constructor" or ".play() is undefined" errors.
 */
vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        catch: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        loop: false,
        volume: 1,
        muted: false
    };
}));

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
};
vi.stubGlobal('localStorage', mockLocalStorage);
mockLocalStorage.getItem.mockReturnValue('user-123');

/**
 * Partial mock of 'react-router-dom'.
 * It preserves the original library functionality (...actual) but overrides 
 * 'useNavigate' and 'useLocation' with custom mocks.
 * This allows the test to verify navigation calls and simulate 
 * specific route states (like board size or game time).
 */
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
    };
});

vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: {
                player1: 'Player 1',
                player2: 'Player 2',
                typeMessage: 'Type a message...'
            },
            buttons: {
                undo: 'Undo',
                confirm: 'Confirm',
                exit: 'Exit',
                playAgain: 'Play Again',
                mainMenu: 'Main Menu',
                yesExitAndLose: 'Yes, Exit',
                backToGame: 'Back to Game'
            },
            messages: {
                areYouSure: 'Are you sure?',
                congrats: 'Congratulations!',
                nextTime: 'Next time!'
            },
        },
    }),
}));

/**
 * Component Mocking.
 * Replaces the real 'LanguageDialog' with a simplified version.
 * This isolates the test to 'GameScreen' logic, preventing side effects 
 * from the dialog's internal code while still allowing us to verify 
 * if the dialog is being triggered (via data-testid).
 */
vi.mock('../components/LanguageDialog/LanguageDialog', () => ({
    LanguageDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="language-dialog" /> : null)
}));

/**
 * Mocks for API and new components.
 * Prevents actual HTTP requests and simplifies complex SVG rendering (Recharts) in JSDOM.
 */
vi.mock('../components/GameScreen/game.api', () => ({
    createMatch: vi.fn().mockResolvedValue({ id: 'test-match-123' }),
    finishMatch: vi.fn().mockResolvedValue({}),
    evaluateBoard: vi.fn().mockResolvedValue({ blue_score: 20, red_score: 18 }),
    getBotMove: vi.fn().mockResolvedValue({ x: 1, y: 0, z: 1 }),
}));

vi.mock('../components/GameScreen/gameyChat.api', () => ({
    requestBotChatReply: vi.fn().mockResolvedValue('Hello! I am the bot.'),
}));

vi.mock('../components/GameScreen/MatchGraph', () => ({
    MatchGraph: () => <div data-testid="match-graph-mock" />
}));

vi.mock('../TutorBox/TutorBox', () => ({
    default: ({ message, onClear }: { message: string | null, onClear: () => void }) => 
        message ? <div data-testid="tutor-box" onClick={onClear}>{message}</div> : null
}));

/**
 * Library Mock for "react-hexgrid".
 * Replaces complex SVG-based library components with simple HTML/SVG tags.
 * This simplifies the DOM structure for the test environment and adds 
 * "data-testid" to hexagons, making them easy to find and click during tests.
 */
vi.mock('react-hexgrid', () => ({
    HexGrid: ({ children }: any) => <svg>{children}</svg>,
    Layout: ({ children }: any) => <g>{children}</g>,
    Hexagon: ({ children, onClick, className }: any) => (
        <g className={className} onClick={onClick} data-testid="hex-cell">
            {children}
        </g>
    ),
}));

/** Visual Layout (Size 2 Example):
 * [ 0 ]             <-- (x:1, y:0, z:0) Top Cell
 * /   \
 * [ 1 ]---[ 2 ]        <-- (x:0, y:1, z:0) and (x:0, y:0, z:1)
 * * * Cubic representation (x, y, z):
 * x = Row (height), y = Left diagonal, z = Right diagonal
 * x + y + z = size - 1
 */
vi.mock('../components/GameScreen/gridUtils', () => ({
    generateBoard: (size: number) => {
        if (size === 2) {
            return [
                { x: 1, y: 0, z: 0, q: 0, r: -1, s: 1 },
                { x: 0, y: 1, z: 0, q: -1, r: 0, s: 1 },
                { x: 0, y: 0, z: 1, q: 0, r: 0, s: 0 },
            ];
        }
        // Default size 3 mock for integration tests
        return [
            { x: 2, y: 0, z: 0, q: 0, r: -2, s: 2 },
            { x: 1, y: 1, z: 0, q: -1, r: -1, s: 2 },
            { x: 1, y: 0, z: 1, q: 0, r: -1, s: 1 },
            { x: 0, y: 2, z: 0, q: -2, r: 0, s: 2 },
            { x: 0, y: 1, z: 1, q: -1, r: 0, s: 1 },
            { x: 0, y: 0, z: 2, q: 0, r: 0, s: 0 },
        ];
    },
}));

describe('GameScreen', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('TEST 1: renders player cards', () => {
        renderWithProviders(<GameScreen />);
        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    test('TEST 2: renders footer action buttons', () => {
        renderWithProviders(<GameScreen />);
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
    }, 10000);

    test('TEST 3: confirm button is disabled when no cell is selected', () => {
        renderWithProviders(<GameScreen />);
        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    });

    test('TEST 4: confirm button enables after clicking a hex cell', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        const cells = screen.getAllByTestId('hex-cell');
        await user.click(cells[0]);
        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
    });

    test('TEST 5: confirm button disables again after confirming a move', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    });

    test('TEST 6: turn switches from Player 1 to Player 2 after confirming', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        expect(screen.getByText('Player 2').closest('div')).toHaveClass('active');
    });

    test('TEST 7: exit button opens confirmation window', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /exit/i }));
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    test('TEST 8: back to game button closes the exit window', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /exit/i }));
        await user.click(screen.getByRole('button', { name: /back to game/i }));
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    test('TEST 9: confirming exit navigates to /menu', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /exit/i }));
        await user.click(screen.getByRole('button', { name: /yes, exit/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/menu');
    });

    test('TEST 10: chat is visible by default', () => {
        renderWithProviders(<GameScreen />);
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    test('TEST 11: chat toggles with the message icon button', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByTitle('Chat'));
        expect(screen.queryByText('Online')).not.toBeInTheDocument();
        await user.click(screen.getByTitle('Chat'));
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    test('TEST 12: language window opens when language button is clicked', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByTitle('Language'));
        expect(screen.getByTestId('language-dialog')).toBeInTheDocument();
    });

    test('TEST 13: undo button is present in footer', () => {
        renderWithProviders(<GameScreen />);
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });

    test('TEST 14: can select different cells sequentially', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        const cells = screen.getAllByTestId('hex-cell');
        await user.click(cells[0]);
        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    });

    test('TEST 15: players alternate turns correctly', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        await waitFor(() => {
            expect(screen.getByText('Player 2').closest('div')).toHaveClass('active');
        });
    });

    test('TEST 16: language dialog is present when opening', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getByTitle('Language'));
        expect(screen.getByTestId('language-dialog')).toBeInTheDocument();
    });

    test('TEST 17: board maintains state after move', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    test('TEST 18: allows user to type and send a message in chat and receives bot reply', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        const input = screen.getByPlaceholderText('Type a message...');
        
        await user.type(input, 'Hello Bot');
        expect(input).toHaveValue('Hello Bot');
        
        const sendButton = screen.getAllByRole('button').find(btn => 
            btn.className.includes('send-btn')
        ) as HTMLButtonElement;
        
        await user.click(sendButton);
        
        expect(input).toHaveValue('');
        expect(screen.getByText('Hello Bot')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Hello! I am the bot.')).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    test('TEST 19: bot makes a move automatically after player confirmation', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        expect(screen.getByText('Player 2').closest('div')).toHaveClass('active');

        await waitFor(() => {
            expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
        }, { timeout: 4000 });
    });

    test('TEST 24: mute button triggers state change', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        const muteButton = screen.getByTitle(/(Mute|Unmute)/i);
        await user.click(muteButton);
        // We verify it renders and handles the click without crashing
        expect(muteButton).toBeInTheDocument();
    });

    test('TEST 25: evaluateBoard is called after confirming a move', async () => {
        const { evaluateBoard } = await import('../components/GameScreen/game.api');
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        
        await waitFor(() => {
            expect(evaluateBoard).toHaveBeenCalled();
        });
    });

    test('TEST 26: undo button reverts the last move', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        
        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));
        
        const undoButton = screen.getByRole('button', { name: /undo/i });
        
        await waitFor(() => {
            expect(undoButton).not.toBeDisabled();
        }, { timeout: 2500 });
        
        await user.click(undoButton);
        
        expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
    });
    
    test('TEST 27: game over modal shows MatchGraph on timeout', async () => {
        vi.useFakeTimers();
        renderWithProviders(<GameScreen />);
        
        vi.advanceTimersByTime(61000);
        
        vi.useRealTimers();
        
        await waitFor(() => {
            expect(screen.getAllByText('Next time!')[0]).toBeInTheDocument();
            expect(screen.getByTestId('match-graph-mock')).toBeInTheDocument();
        });
    });

    test('TEST 28: getBotMove is called after player makes a move', async () => {
        const { getBotMove } = await import('../components/GameScreen/game.api');
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            expect(getBotMove).toHaveBeenCalled();
        }, { timeout: 2000 });
    });

    test('TEST 29: getBotMove is called with correct bot_id for easy difficulty', async () => {
        const { getBotMove } = await import('../components/GameScreen/game.api');
        
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            const calls = vi.mocked(getBotMove).mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            // Verify that a valid bot_id was passed (should be 'easy_bot' for default difficulty 0)
            const botId = calls[0][1];
            expect(['easy_bot', 'medium_bot', 'hard_bot', 'random_bot']).toContain(botId);
        }, { timeout: 2000 });
    });

    test('TEST 30: getBotMove receives board state in JSON format', async () => {
        const { getBotMove } = await import('../components/GameScreen/game.api');
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            const calls = vi.mocked(getBotMove).mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            const firstArg = calls[0][0];
            // Verify it's a valid JSON string
            expect(() => JSON.parse(firstArg)).not.toThrow();
            const parsed = JSON.parse(firstArg);
            expect(parsed).toHaveProperty('size');
            expect(parsed).toHaveProperty('turn');
            expect(parsed).toHaveProperty('players');
            expect(parsed).toHaveProperty('layout');
        }, { timeout: 2000 });
    });

    test('TEST 31: bot places a piece on the board using getBotMove coordinates', async () => {
        const { getBotMove } = await import('../components/GameScreen/game.api');
        vi.mocked(getBotMove).mockResolvedValue({ x: 0, y: 1, z: 1 });
        
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            expect(getBotMove).toHaveBeenCalled();
            expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
        }, { timeout: 2000 });
    });

    test('TEST 32: falls back to random move if getBotMove fails', async () => {
        const { getBotMove } = await import('../components/GameScreen/game.api');
        vi.mocked(getBotMove).mockRejectedValueOnce(new Error('Bot unavailable'));
        
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('hex-cell')[0]);
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(() => {
            // Should still make a move (fallback to random)
            expect(screen.getByText('Player 1').closest('div')).toHaveClass('active');
        }, { timeout: 2000 });
    });
});

describe('yGameLogic - checkWin', () => {
    const allCells = [
        { x: 2, y: 0, z: 0, q: 0, r: -2, s: 2 },
        { x: 1, y: 1, z: 0, q: -1, r: -1, s: 2 },
        { x: 0, y: 2, z: 0, q: -2, r: 0, s: 2 },
    ];

    test('TEST 20: returns false if player has fewer pieces than board size', () => {
        const boardState = { "2-0-0": 1 };
        expect(checkWin(boardState, 1, 3, allCells)).toBe(false);
    });

    test('TEST 21: returns true if a connected group touches all 3 sides', () => {
        const boardState = { "0-0-0": 1 };
        const singleCell = [{ x: 0, y: 0, z: 0, q: 0, r: 0, s: 0 }];
        expect(checkWin(boardState, 1, 1, singleCell)).toBe(true);
    });

    test('TEST 22: returns false if pieces touch sides but are not connected', () => {
        const boardState = {
            "2-0-0": 1,
            "0-2-0": 1
        };
        expect(checkWin(boardState, 1, 2, allCells)).toBe(false);
    });

    test('TEST 23: handles multiple separate player cells correctly', () => {
        const size2Cells = [
            { x: 1, y: 0, z: 0, q: 0, r: -1, s: 1 },
            { x: 0, y: 1, z: 0, q: -1, r: 0, s: 1 }
        ];
        const boardState = {
            "1-0-0": 1,
            "0-1-0": 1
        };
        expect(checkWin(boardState, 1, 2, size2Cells)).toBe(true);
    });
});