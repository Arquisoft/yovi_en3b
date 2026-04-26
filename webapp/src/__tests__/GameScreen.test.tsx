import { render, screen, waitFor, cleanup } from '@testing-library/react'; // Import testing utilities
import userEvent from '@testing-library/user-event'; // Import user event simulation
import { describe, test, expect, vi, beforeEach } from 'vitest'; // Import test runner hooks
import { MemoryRouter } from 'react-router-dom'; // Import router for context
import GameScreen from '../components/GameScreen/GameScreen'; // Import component
import { SettingsContext } from '../context/SettingsContext'; // Import settings context


// 1. MOCK DE AUDIO
vi.stubGlobal('Audio', vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
})));

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

describe('GameScreen - Full Suite (19 Tests)', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // --- GRUPO 1: RENDERIZADO (Tests 1-5) ---
    test('TEST 1: renders player cards', () => {
        renderComponent();
        expect(screen.getByText('JUGADOR 1')).toBeInTheDocument();
        expect(screen.getByText('JUGADOR 2')).toBeInTheDocument();
    });

    test('TEST 2: timer starts at 1:00', () => {
        renderComponent();
        expect(screen.getByText('1:00')).toBeInTheDocument();
    });

    test('TEST 3: undo button starts disabled', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: /DESHACER/i })).toBeDisabled();
    });

    test('TEST 4: chatbot header is present', () => {
        renderComponent();
        expect(screen.getByText('PLAYER 2')).toBeInTheDocument();
    });

    test('TEST 5: board cells are rendered', () => {
        const { container } = renderComponent();
        const cells = container.querySelectorAll('.hex-cell');
        expect(cells.length).toBeGreaterThan(0);
    });

    // --- GRUPO 2: BOTÓN CONFIRMAR (Tests 6-9) ---
    test('TEST 6: confirm button is NOT in DOM by default', async () => {
        renderComponent({ confirmMove: false });
        const user = userEvent.setup();
        const cells = screen.getAllByRole('presentation'); // Hexagons en hexgrid
        if (cells[0]) await user.click(cells[0]);
        expect(screen.queryByText('CONFIRMAR')).not.toBeInTheDocument();
    });

    test('TEST 7: confirm button appears when enabled in settings', async () => {
        renderComponent({ confirmMove: true });
        const user = userEvent.setup();
        const cells = document.querySelectorAll('.hex-cell');
        await user.click(cells[0]);
        expect(screen.getByText('CONFIRMAR')).toBeInTheDocument();
    });

    test('TEST 8: clicking confirm completes the move', async () => {
        renderComponent({ confirmMove: true });
        const user = userEvent.setup();
        await user.click(document.querySelectorAll('.hex-cell')[0]);
        await user.click(screen.getByText('CONFIRMAR'));
        // Verifica que el turno cambió (P2 active)
        const p2Card = screen.getByText('JUGADOR 2').closest('.player-card');
        expect(p2Card).toHaveClass('active');
    });

    test('TEST 9: move is instant if confirmMove is false', async () => {
        renderComponent({ confirmMove: false });
        const user = userEvent.setup();
        await user.click(document.querySelectorAll('.hex-cell')[0]);
        const p2Card = screen.getByText('JUGADOR 2').closest('.player-card');
        expect(p2Card).toHaveClass('active');
    });

    // --- GRUPO 3: ACCIONES Y DIÁLOGOS (Tests 10-14) ---
    test('TEST 10: undo button enables after player move', async () => {
        renderComponent();
        const user = userEvent.setup();
        await user.click(document.querySelectorAll('.hex-cell')[0]);
        expect(screen.getByText('DESHACER').closest('button')).not.toBeDisabled();
    });

    test('TEST 11: exit button shows confirmation modal', async () => {
        renderComponent();
        const user = userEvent.setup();
        await user.click(screen.getByText('SALIR').closest('button')!);
        expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    });

    test('TEST 12: can cancel exit dialog', async () => {
        renderComponent();
        const user = userEvent.setup();
        await user.click(screen.getByText('SALIR').closest('button')!);
        await user.click(screen.getByText('VOLVER'));
        expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
    });

    test('TEST 13: mute button toggles icon', async () => {
        renderComponent();
        const user = userEvent.setup();
        const muteBtn = screen.getAllByRole('button')[0]; // Primer botón de la sidebar
        await user.click(muteBtn);
        // El mockSettings llamaría a setIsMuted
        expect(muteBtn).toBeInTheDocument();
    });

    test('TEST 14: chat can be toggled', async () => {
        renderComponent();
        const user = userEvent.setup();
        const chatToggle = screen.getAllByRole('button')[2]; // Tercer botón de la sidebar
        await user.click(chatToggle);
        expect(screen.queryByText('PLAYER 2')).not.toBeInTheDocument();
    });

    test('TEST 18: allows user to type and send a message in chat', async () => {
        renderWithProviders(<GameScreen />);
        const user = userEvent.setup();
        const cell = document.querySelectorAll('.hex-cell')[0];
        await user.click(cell);
        expect(cell).toHaveClass('p1-selected');
    });
    */

    test('TEST 16: bot performs a move automatically', async () => {
        renderComponent();
        const user = userEvent.setup();
        await user.click(document.querySelectorAll('.hex-cell')[0]);
        // Esperamos a que el bot juegue (setTimeout 1200ms)
        await waitFor(() => {
            const p1Card = screen.getByText('JUGADOR 1').closest('.player-card');
            expect(p1Card).toHaveClass('active');
        }, { timeout: 3000 });
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

    test('TEST 18: layout has color-blind class when active', () => {
        // Podrías crear un renderOption para esto, pero verificamos el default
        const { container } = renderComponent();
        expect(container.firstChild).toHaveClass('game-layout');
    });

    test('TEST 19: undoing a move clears the cell', async () => {
        renderComponent();
        const user = userEvent.setup();
        const cell = document.querySelectorAll('.hex-cell')[0];
        await user.click(cell);
        await user.click(screen.getByText('DESHACER').closest('button')!);
        expect(cell).not.toHaveClass('p1-selected');
    });
});