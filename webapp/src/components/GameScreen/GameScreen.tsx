import React, { useState } from 'react';
import {
    Languages,
    Settings,
    X,
    Undo2,
    Lightbulb,
    CheckCircle2,
    LogOut,
    MoreVertical,
    MessageSquare,
    HelpCircle
} from 'lucide-react';
import './GameScreen.css';
import { generateBoard, type Cell } from './gridUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageDialog } from '../../components/LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';


const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Size of the board
    const size = location.state?.size || 3;

    // Cells generated 
    const cells = generateBoard(size);

    // Offsets to center the board
    // Not exact values, just try and error to try to center it
    const offsetX = size * 4.75;
    const offsetY = (size - 1) * 5;


    const { t } = useI18n();
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);

    // Saves who (player 1 or player 2) has occupied each cell -> Key: "x-y-z"
    const [boardState, setBoardState] = useState<Record<string, number>>({});
    // Tracks current turn
    const [currentPlayer, _setCurrentPlayer] = useState(1);
    // Temporarily stores what cell is selected before clicking confirm
    const [pendingMove, setPendingMove] = useState<Cell | null>(null);

    // Manages the clicks on the board
    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`;

        // If it has already an owner, ignore it
        if (boardState[key]) return;

        // Mark it as "pending to confirm" 
        setPendingMove(cell);
    };

    const handleConfirm = () => {
        if (!pendingMove) return;

        const key = `${pendingMove.x}-${pendingMove.y}-${pendingMove.z}`;

        // Save the movement
        setBoardState(prev => ({
            ...prev,
            [key]: currentPlayer
        }));

        // Clear the "pending to confirm" move
        setPendingMove(null);
        // Change to the other player
        _setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    };

    return (
        <div className="game-layout">
            {/* LEFT PART -> Board & Buttons */}
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}>
                        {t.labels.player1}
                    </div>
                    <span className="vs-text">{t.labels.vs}</span>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}>
                        {t.labels.player2}
                    </div>
                </header>

                <main className="board-area">
                    <div className="triangle-board" style={{ width: '100%', height: '100%' }}>
                        <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
                            <Layout
                                size={{ x: 6, y: 6 }}
                                flat={false}
                                spacing={1.1}
                                origin={{ x: offsetX, y: offsetY }}
                            >
                                {cells.map((cell) => {
                                    // Generating unique key to identify each cell
                                    const key = `${cell.x}-${cell.y}-${cell.z}`;
                                    // Owner of the cell (if there is any)
                                    const owner = boardState[key];
                                    // Gets whether the cell is selected
                                    const isSelected = pendingMove?.x === cell.x && pendingMove?.y === cell.y && pendingMove?.z === cell.z;

                                    return (
                                        <Hexagon
                                            key={key}
                                            q={cell.q}
                                            r={cell.r}
                                            s={cell.s}
                                            className={`hex-cell 
                                                ${owner === 1 ? 'p1-selected' : ''} 
                                                ${owner === 2 ? 'p2-selected' : ''}
                                                ${isSelected ? 'pending-selection' : ''}`}
                                            onClick={() => handleClick(cell)}

                                        >
                                            <text x="0" y="1" fontSize="2" textAnchor="middle" fill="#999">
                                                {`${cell.x},${cell.y},${cell.z}`}
                                            </text>
                                        </Hexagon>
                                    );
                                })}
                            </Layout>
                        </HexGrid>
                    </div>
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn"><Undo2 size={16} /> {t.buttons.undo}</button>
                    <button className="game-action-btn"><Lightbulb size={16} /> {t.buttons.hint}</button>
                    <button
                        className="game-action-btn btn-confirm-blue"
                        onClick={handleConfirm}
                        disabled={!pendingMove} // Disabled if there is no pending move
                    >
                        <CheckCircle2 size={16} /> {t.buttons.confirm}
                    </button>
                    <button className="game-action-btn" onClick={() => setShowExitConfirmation(true)}>
                        <LogOut size={16} /> {t.buttons.exit}
                    </button>
                </footer>
            </div>

            {/* CHAT & SETTINGS BAR */}
            <aside className="game-sidebar">

                {/* Settings bar */}
                <div className="global-settings-bar">
                    <button
                        className="icon-btn"
                        title={t.buttons.language}
                        onClick={() => setShowLanguageDialog(true)}
                    >
                        <Languages size={28} />
                    </button>

                    <button className="icon-btn-global" title={t.buttons.howToPlay}>
                        <HelpCircle size={20} />
                    </button>

                    <button
                        className={`icon-btn-global ${isChatOpen ? 'active-link' : ''}`}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        title={t.messages.openChat}
                    >
                        <MessageSquare size={20} />
                    </button>

                    <button className="icon-btn-global" title={t.buttons.settings}>
                        <Settings size={20} />
                    </button>
                </div>




                {/* Chat */}
                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <div className="avatar-circle">P2</div>
                                <div className="user-details">
                                    <span className="user-name">PLAYER 2 </span>
                                    <span className="status-online">Online</span>
                                </div>
                            </div>
                            <div className="chat-actions">
                                <button className="icon-btn-chat" title="More options"><MoreVertical size={18} /></button>
                                <button className="icon-btn-chat close-x" onClick={() => setIsChatOpen(false)} title="Close chat">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="chat-messages">
                            <div className="message received">Good luck!</div>
                            <div className="message sent">Thanks! You too.</div>
                            <div className="message received">This is a tough game.</div>
                        </div>

                        <div className="chat-input-wrapper">
                            <input type="text" placeholder="..." className="chat-input-field" />
                            <button className="send-confirm-btn">✓</button>
                        </div>
                    </div>
                )}
            </aside>

            {/* EXIT CONFIRMATION WINDOW */}
            {showExitConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">
                            <span style={{ fontSize: '40px' }}>⚠️</span>
                        </div>
                        <h2>{t.messages.areYouSure}</h2>
                        <p>{t.messages.loseWarning}</p>

                        <div className="modal-buttons">
                            <button className="btn-confirm-exit" onClick={() => navigate('/menu')}>
                                {t.buttons.yesExitAndLose}
                            </button>
                            <button className="btn-cancel" onClick={() => setShowExitConfirmation(false)}>
                                {t.buttons.backToGame}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LANGUAGE DIALOG */}
            <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} />
        </div>
    );
};

export default GameScreen;