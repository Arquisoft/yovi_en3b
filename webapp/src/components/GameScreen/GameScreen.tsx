import React, { useState, useEffect } from 'react';
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot
} from 'lucide-react';
import './GameScreen.css';
import { generateBoard, type Cell } from './gridUtils';
import { checkWin } from './yGameLogic';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageDialog } from '../LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';

const GameScreen: React.FC = () => {
    const navigate = useNavigate(); // Hook to handle navigation between pages
    const location = useLocation(); // Hook to access state passed from the menu
    const { t } = useI18n(); // Translation hook for internationalization

    const {
        size = 5,
        time: initialTime = null,
        botType = 'robot'
    } = location.state || {}; // Get game settings from navigation state

    const [timeLeft, setTimeLeft] = useState<number | null>(initialTime); // State for the countdown timer
    const [cells] = useState(generateBoard(size)); // Generate the hexagonal grid based on size
    const [isChatOpen, setIsChatOpen] = useState(true); // State to toggle sidebar chat visibility
    const [showExitConfirmation, setShowExitConfirmation] = useState(false); // State for exit modal
    const [showLanguageDialog, setShowLanguageDialog] = useState(false); // State for language settings modal
    const [boardState, setBoardState] = useState<Record<string, number>>({}); // Map of cell keys to player IDs
    const [currentPlayer, setCurrentPlayer] = useState(1); // Track whose turn it is (1 or 2)
    const [pendingMove, setPendingMove] = useState<Cell | null>(null); // Temporary selection before confirming
    const [botCooldown, setBotCooldown] = useState(false); // Prevents player interaction during bot's turn
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null); // Stores final game outcome
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);  // List of messages sent
    const [inputValue, setInputValue] = useState(''); // Message being written

    // Function to format seconds into M:SS format
    const formatDisplayTime = (seconds: number | null) => {
        if (seconds === null) return "∞"; // Return infinity symbol if no time limit
        const mins = Math.floor(seconds / 60); // Calculate whole minutes
        const secs = seconds % 60; // Calculate remaining seconds
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`; // Format as M:SS with leading zero
    };

    // Logic for sending a message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return; // Just to stop sending only whitespaces

        // Adds the message with the player
        setMessages(prev => [...prev, { sender: 'player', text: inputValue.trim() }]);
        setInputValue(''); // Clears the writting message textbox
    };

    useEffect(() => {
        if (timeLeft === null || gameResult) return; // Stop timer if infinite or game ended
        if (timeLeft <= 0) {
            setGameResult('lose'); // Set game as lost if time runs out
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000); // Decrease seconds
        return () => clearInterval(timer); // Cleanup interval on component unmount
    }, [timeLeft, gameResult]);

    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`; // Generate unique key for the cell
        if (gameResult || botCooldown || boardState[key]) return; // Block click if game over, bot's turn, or cell taken
        setPendingMove(cell); // Highlight cell as pending selection
    };

    const handleConfirm = () => {
        if (!pendingMove || gameResult) return; // Ensure a move is selected and game is active
        const key = `${pendingMove.x}-${pendingMove.y}-${pendingMove.z}`; // Key for the confirmed move

        const newBoardState = { ...boardState, [key]: 1 }; // Update board with player 1's move
        setBoardState(newBoardState); // Save new board state
        setPendingMove(null); // Clear the temporary selection

        if (checkWin(newBoardState, 1, size, cells)) {
            setGameResult('win'); // Trigger win modal if connection is formed
            return;
        }

        setCurrentPlayer(2); // Pass turn to the bot
        setBotCooldown(true); // Disable user input
        setTimeout(() => {
            const availableCells = cells.filter(c => !newBoardState[`${c.x}-${c.y}-${c.z}`]); // Find empty cells
            if (availableCells.length > 0) {
                const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)]; // Pick random move
                const botKey = `${randomCell.x}-${randomCell.y}-${randomCell.z}`; // Bot's selected cell key
                const stateAfterBot = { ...newBoardState, [botKey]: 2 }; // Update state with bot's move
                setBoardState(stateAfterBot); // Save bot's move

                if (checkWin(stateAfterBot, 2, size, cells)) {
                    setGameResult('lose'); // Trigger lose modal if bot wins
                }
            }
            setCurrentPlayer(1); // Return turn to player
            setBotCooldown(false); // Re-enable user input
        }, 1200); // Artificial delay to simulate bot "thinking"
    };

    const restartGame = () => {
        setBoardState({}); // Clear all pieces from the board
        setGameResult(null); // Reset game outcome state
        setCurrentPlayer(1); // Set turn back to player 1
        setTimeLeft(initialTime); // Reset timer to initial settings
    };

    return (
        <div className="game-layout">
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}>{(t.labels as any).player1}</div>
                    <div className={`game-timer-wrapper ${timeLeft !== null && timeLeft < 20 ? 'timer-low' : ''}`}>
                        <span className="timer-value">{formatDisplayTime(timeLeft)}</span>
                    </div>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}>{(t.labels as any).player2}</div>
                </header>

                <main className="board-area">
                    <div className="triangle-board">
                        <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
                            <Layout size={{ x: 6, y: 6 }} flat={false} spacing={1.08} origin={{ x: size * 4.75, y: (size - 1) * 5 }}>
                                {cells.map((cell) => {
                                    const key = `${cell.x}-${cell.y}-${cell.z}`; // Key for mapping cells
                                    const owner = boardState[key]; // Identify if player 1, 2 or none owns the cell
                                    const isSelected = pendingMove?.x === cell.x && pendingMove?.y === cell.y && pendingMove?.z === cell.z; // UI state for selection
                                    return (
                                        <Hexagon
                                            key={key} q={cell.q} r={cell.r} s={cell.s}
                                            className={`hex-cell ${owner === 1 ? 'p1-selected' : ''} ${owner === 2 ? 'p2-selected' : ''} ${isSelected ? 'pending-selection' : ''}`}
                                            onClick={() => handleClick(cell)}
                                        />
                                    );
                                })}
                            </Layout>
                        </HexGrid>
                    </div>
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn"><Undo2 size={18} /> <span>{t.buttons.undo}</span></button>
                    <button className="game-action-btn btn-confirm-blue" onClick={handleConfirm} disabled={!pendingMove || botCooldown}><CheckCircle2 size={18} /> <span>{t.buttons.confirm}</span></button>
                    <button className="game-action-btn btn-exit-footer" onClick={() => setShowExitConfirmation(true)}><LogOut size={18} /> <span>{t.buttons.exit}</span></button>
                </footer>
            </div>

            <aside className="game-sidebar">
                <div className="global-settings-bar">
                    <button className="icon-btn-global" onClick={() => setShowLanguageDialog(true)}><Languages size={20} /></button>
                    <button className="icon-btn-global" onClick={() => setIsChatOpen(!isChatOpen)}><MessageSquare size={20} /></button>
                </div>
                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="bot-profile-badge">
                                <div className="bot-avatar-circle">
                                    {botType === 'chip' ? <Cpu size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="bot-info-text">
                                    <span className="bot-name-chat">PLAYER 2</span>
                                    <span className="bot-status-tag">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Área de mensajes */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="message sent">
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Formulario para escribir */}
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t.labels.typeMessage || "Escribe..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                                <CheckCircle2 size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </aside>

            {/* MODAL FOR GAME OUTCOME (WIN/LOSS) */}
            {gameResult && (
                <div className="modal-overlay">
                    <div className="modal-content result-modal">
                        <h2 className={gameResult === 'win' ? 'text-win' : 'text-lose'}>
                            {gameResult === 'win' ? t.messages.congrats : t.messages.nextTime}
                        </h2>

                        {/* Añadimos la clase modal-text aquí */}
                        <p className="modal-text">
                            {gameResult === 'win' ? t.messages.winDetail : t.messages.loseDetail}
                        </p>

                        <div className="modal-buttons-column">
                            <button className="main-button btn-blue" onClick={restartGame}>
                                {t.buttons.playAgain}
                            </button>
                            <button className="main-button btn-red-outline" onClick={() => navigate('/menu')}>
                                {t.buttons.mainMenu}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXIT CONFIRMATION MODAL */}
            {showExitConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{t.messages.areYouSure}</h2>
                        <div className="modal-buttons-column">
                            <button className="main-button btn-red" onClick={() => navigate('/menu')}>{t.buttons.yesExitAndLose}</button>
                            <button className="main-button btn-blue-outline" onClick={() => setShowExitConfirmation(false)}>{t.buttons.backToGame}</button>
                        </div>
                    </div>
                </div>
            )}
            <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} />
        </div>
    );
};

export default GameScreen;