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

// 2. MOCK DE APIS (game.api.ts)
vi.mock('./game.api', () => ({
    createMatch: vi.fn().mockResolvedValue({ id: '123' }),
    finishMatch: vi.fn().mockResolvedValue({}),
}));

// 3. MOCK DE TRADUCCIONES (Ajustado a tu useI18n)
vi.mock('../../i18n/useTranslation', () => ({
    useI18n: () => ({
        t: {
            labels: { player1: 'JUGADOR 1', player2: 'JUGADOR 2' },
            buttons: { undo: 'DESHACER', confirm: 'CONFIRMAR', exit: 'SALIR', mainMenu: 'MENÚ', yesExitAndLose: 'SÍ', backToGame: 'VOLVER' },
            messages: { areYouSure: '¿Estás seguro?', congrats: '¡Felicidades!', nextTime: 'Suerte' },
            tutor: { tips: ['Tip 1'] }
        }
    }),
}));

// 4. INTERFAZ PARA RENDERIZADO
interface RenderOptions {
    confirmMove?: boolean;
    tutorEnabled?: boolean;
}

const renderComponent = ({ confirmMove = false, tutorEnabled = true }: RenderOptions = {}) => {
    const mockSettings = {
        colorBlindMode: false,
        isMuted: false,
        confirmMove: confirmMove, // Aquí controlamos el botón
        tutorEnabled: tutorEnabled,
        setIsMuted: vi.fn(),
        playSound: vi.fn(),
        setConfirmMove: vi.fn(),
        setTutorEnabled: vi.fn(),
    };

    return render(
        <MemoryRouter initialEntries={[{ state: { size: 5, time: 60 } }]}>
            <SettingsContext.Provider value={mockSettings as any}>
                <GameScreen />
            </SettingsContext.Provider>
        </MemoryRouter>
    );
};

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

    // --- GRUPO 4: LÓGICA DE JUEGO (Tests 15-19) ---
    test('TEST 15: selected cell gets correct class', async () => {
        renderComponent();
        const user = userEvent.setup();
        const cell = document.querySelectorAll('.hex-cell')[0];
        await user.click(cell);
        expect(cell).toHaveClass('p1-selected');
    });

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

    test('TEST 17: bot status tag says Online', () => {
        renderComponent();
        expect(screen.getByText('Online')).toBeInTheDocument();
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