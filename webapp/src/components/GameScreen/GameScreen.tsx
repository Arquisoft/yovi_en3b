// UBICACIÓN: webapp/src/pages/GameScreen.tsx
import React, { useState, useEffect } from 'react'; // React hooks for state and lifecycle
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot
} from 'lucide-react'; // Icons for UI
import './GameScreen.css'; // Specific game styles
import { generateBoard, type Cell } from './gridUtils'; // Utility to generate hex grid
import { checkWin } from './yGameLogic'; // Game logic for victory condition
import { useNavigate, useLocation } from 'react-router-dom'; // Navigation hooks
import { LanguageDialog } from '../LanguageDialog/LanguageDialog'; // Multi-language modal
import { useI18n } from '../../i18n/useTranslation'; // Translation hook
import { useSettings } from '../../context/SettingsContext'; // Global settings hook
import { HexGrid, Layout, Hexagon } from 'react-hexgrid'; // Hexagonal grid components

const GameScreen: React.FC = () => {
    const navigate = useNavigate(); // Hook to navigate between routes
    const location = useLocation(); // Hook to access route state
    const { t } = useI18n(); // Access translations
    const { colorBlindMode } = useSettings(); // Access global colorblind setting

    // Game Configuration from route state
    const {
        size = 5,
        time: initialTime = null,
        botType = 'robot'
    } = location.state || {};

    // Game States
    const [timeLeft, setTimeLeft] = useState<number | null>(initialTime); // Remaining time
    const [cells] = useState(generateBoard(size)); // Hexagon data
    const [isChatOpen, setIsChatOpen] = useState(true); // Chat visibility
    const [showExitConfirmation, setShowExitConfirmation] = useState(false); // Exit modal toggle
    const [showLanguageDialog, setShowLanguageDialog] = useState(false); // Language modal toggle
    const [boardState, setBoardState] = useState<Record<string, number>>({}); // Placed pieces
    const [currentPlayer, setCurrentPlayer] = useState(1); // Active player (1 or 2)
    const [pendingMove, setPendingMove] = useState<Cell | null>(null); // Clicked but not confirmed cell
    const [botCooldown, setBotCooldown] = useState(false); // Prevents player move during bot turn
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null); // Game end status
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]); // Chat log
    const [inputValue, setInputValue] = useState(''); // Current chat input text

    // Dynamic colors based on Color Blind Mode
    const p1Color = colorBlindMode ? '#f59e0b' : '#60a5fa'; // Orange (Colorblind) or Blue (Default)
    const p2Color = colorBlindMode ? '#ffffff' : '#ef4444'; // White (Colorblind) or Red (Default)

    const formatDisplayTime = (seconds: number | null) => {
        if (seconds === null) return "∞"; // Infinite time display
        const mins = Math.floor(seconds / 60); // Calculate minutes
        const secs = seconds % 60; // Calculate seconds
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`; // Format as MM:SS
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent page refresh
        if (!inputValue.trim()) return; // Avoid empty messages
        setMessages(prev => [...prev, { sender: 'player', text: inputValue.trim() }]); // Add message to log
        setInputValue(''); // Clear input
    };

    useEffect(() => {
        if (timeLeft === null || gameResult) return; // Stop timer if game ended or no limit
        if (timeLeft <= 0) {
            setGameResult('lose'); // End game on timeout
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000); // Decrement time
        return () => clearInterval(timer); // Clean up on unmount
    }, [timeLeft, gameResult]);

    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`; // Unique key for cell
        if (gameResult || botCooldown || boardState[key]) return; // Block clicks if turn/game finished
        setPendingMove(cell); // Set as unconfirmed selection
    };

    const handleConfirm = () => {
        if (!pendingMove || gameResult) return; // Ensure move exists
        const key = `${pendingMove.x}-${pendingMove.y}-${pendingMove.z}`; // Get move key

        const newBoardState = { ...boardState, [key]: 1 }; // Update board state
        setBoardState(newBoardState); // Apply changes
        setPendingMove(null); // Clear pending state

        if (checkWin(newBoardState, 1, size, cells)) {
            setGameResult('win'); // Check if player won
            return;
        }

        setCurrentPlayer(2); // Pass turn to Bot
        setBotCooldown(true); // Block player interaction
        setTimeout(() => {
            const availableCells = cells.filter(c => !newBoardState[`${c.x}-${c.y}-${c.z}`]); // Find free spots
            if (availableCells.length > 0) {
                const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)]; // Random AI move
                const botKey = `${randomCell.x}-${randomCell.y}-${randomCell.z}`; // Bot key
                const stateAfterBot = { ...newBoardState, [botKey]: 2 }; // Update state for bot
                setBoardState(stateAfterBot); // Apply bot move

                if (checkWin(stateAfterBot, 2, size, cells)) {
                    setGameResult('lose'); // Check if bot won
                }
            }
            setCurrentPlayer(1); // Return turn to player
            setBotCooldown(false); // Re-enable interaction
        }, 1200); // Simulated "thinking" delay
    };

    const restartGame = () => {
        setBoardState({}); // Reset board
        setGameResult(null); // Reset result
        setCurrentPlayer(1); // Reset player turn
        setTimeLeft(initialTime); // Reset clock
    };

    return (
        <div className={`game-layout ${colorBlindMode ? 'color-blind' : ''}`}>
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}
                        style={{ borderColor: currentPlayer === 1 ? p1Color : 'transparent' }}>
                        {t.labels.player1}
                    </div>
                    <div className={`game-timer-wrapper ${timeLeft !== null && timeLeft < 20 ? 'timer-low' : ''}`}
                        style={{ borderColor: p1Color }}>
                        <span className="timer-value" style={{ color: p1Color }}>{formatDisplayTime(timeLeft)}</span>
                    </div>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}
                        style={{ borderColor: currentPlayer === 2 ? p2Color : 'transparent' }}>
                        {t.labels.player2}
                    </div>
                </header>

                <main className="board-area">
                    <div className="triangle-board">
                        <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
                            <Layout size={{ x: 6, y: 6 }} flat={false} spacing={1.08} origin={{ x: size * 4.75, y: (size - 1) * 5 }}>
                                {cells.map((cell) => {
                                    const key = `${cell.x}-${cell.y}-${cell.z}`; // Cell key
                                    const owner = boardState[key]; // Check ownership
                                    const isSelected = pendingMove?.x === cell.x && pendingMove?.y === cell.y && pendingMove?.z === cell.z; // Highlight pending
                                    return (
                                        <Hexagon
                                            key={key} q={cell.q} r={cell.r} s={cell.s}
                                            className={`hex-cell ${owner === 1 ? 'p1-selected' : ''} ${owner === 2 ? 'p2-selected' : ''} ${isSelected ? 'pending-selection' : ''}`}
                                            style={{
                                                fill: owner === 1 ? p1Color : (owner === 2 ? p2Color : ''), // Dynamic fill color
                                                stroke: isSelected ? p1Color : '' // Stroke for pending move
                                            }}
                                            onClick={() => handleClick(cell)} // Click handler
                                        />
                                    );
                                })}
                            </Layout>
                        </HexGrid>
                    </div>
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn"><Undo2 size={18} /> <span>{t.buttons.undo}</span></button>
                    <button className="game-action-btn btn-confirm-action" onClick={handleConfirm} disabled={!pendingMove || botCooldown}>
                        <CheckCircle2 size={18} /> <span>{t.buttons.confirm}</span>
                    </button>
                    <button className="game-action-btn btn-exit-footer" onClick={() => setShowExitConfirmation(true)}>
                        <LogOut size={18} /> <span>{t.buttons.exit}</span>
                    </button>
                </footer>
            </div>

            <aside className="game-sidebar">
                <div className="global-settings-bar">
                    <button title="Language" className="icon-btn-global" onClick={() => setShowLanguageDialog(true)}><Languages size={20} /></button>
                    <button title="Chat" className="icon-btn-global" onClick={() => setIsChatOpen(!isChatOpen)}><MessageSquare size={20} /></button>
                </div>
                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="bot-profile-badge">
                                <div className="bot-avatar-circle" style={{ borderColor: p1Color, color: p1Color }}>
                                    {botType === 'chip' ? <Cpu size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="bot-info-text">
                                    <span className="bot-name-chat">PLAYER 2</span>
                                    <span className="bot-status-tag">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="message sent" style={{ backgroundColor: p1Color }}>{msg.text}</div>
                            ))}
                        </div>

                        {/* Form to type */}
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t.labels.typeMessage}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="send-btn"
                                disabled={!inputValue.trim()}
                                data-testid="chat-send-button"
                                style={{ backgroundColor: p1Color }}
                            >
                                <CheckCircle2 size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </aside>

            {/* RESULT MODAL */}
            {gameResult && (
                <div className="modal-overlay">
                    <div className={`modal-content result-modal ${colorBlindMode ? 'color-blind' : ''}`}>
                        <h2 className={gameResult === 'win' ? 'text-win' : 'text-lose'}>
                            {gameResult === 'win' ? t.messages.congrats : t.messages.nextTime}
                        </h2>
                        <p className="modal-text">
                            {gameResult === 'win' ? t.messages.winDetail : t.messages.loseDetail}
                        </p>
                        <div className="modal-buttons-column">
                            <button className={`main-button ${colorBlindMode ? 'btn-orange' : 'btn-blue'}`} onClick={restartGame}>{t.buttons.playAgain}</button>
                            <button className="main-button btn-red-outline" onClick={() => navigate('/menu')}>{t.buttons.mainMenu}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXIT MODAL */}
            {showExitConfirmation && (
                <div className="modal-overlay">
                    <div className={`modal-content ${colorBlindMode ? 'color-blind' : ''}`}>
                        <h2>{t.messages.areYouSure}</h2>
                        <div className="modal-buttons-column">
                            <button className="main-button btn-red" onClick={() => navigate('/menu')}>{t.buttons.yesExitAndLose}</button>
                            <button className={`main-button ${colorBlindMode ? 'btn-orange-outline' : 'btn-blue-outline'}`} onClick={() => setShowExitConfirmation(false)}>{t.buttons.backToGame}</button>
                        </div>
                    </div>
                </div>
            )}
            <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} />
        </div>
    );
};

export default GameScreen;