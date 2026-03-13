import React, { useState, useEffect } from 'react'; // Added useEffect
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
    HelpCircle,
    Clock // Added Clock icon
} from 'lucide-react';
import './GameScreen.css';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation

const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get data from navigation state

    // 1. EXTRAER SETTINGS (o valores por defecto si entras directo)
    const settings = location.state || { size: 10, difficulty: 'medium', time: 100 };
    
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    
    // 2. ESTADO PARA EL CRONÓMETRO
    const [timeLeft, setTimeLeft] = useState<number | null>(settings.time);

    // 3. LÓGICA DEL CRONÓMETRO (Solo si hay tiempo límite)
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, [timeLeft]);

    return (
        <div className="game-layout">
            {/* LEFT PART -> Board & Buttons */}
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}>
                        PLAYER 1
                    </div>

                    {/* MOSTRAR EL RELOJ AQUÍ (Si hay tiempo) */}
                    <div className="game-timer-display">
                        {timeLeft !== null ? (
                            <div className={`timer-box ${timeLeft < 10 ? 'critical' : ''}`}>
                                <Clock size={20} />
                                <span>{timeLeft}s</span>
                            </div>
                        ) : (
                            <span className="vs-text">vs.</span>
                        )}
                    </div>

                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}>
                        PLAYER 2
                    </div>
                </header>

                <main className="board-area">
                    <div className="triangle-board">
                        {/* 4. EL TABLERO AHORA SABE SU TAMAÑO */}
                        <div className="placeholder-text">
                            Triangular Board: {settings.size} x {settings.size}
                        </div>
                    </div>
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn"><Undo2 size={16} /> UNDO</button>
                    <button className="game-action-btn"><Lightbulb size={16} /> HINT</button>
                    <button className="game-action-btn btn-confirm-blue"><CheckCircle2 size={16} /> CONFIRM</button>
                    <button className="game-action-btn" onClick={() => setShowExitConfirmation(true)}>
                        <LogOut size={16} /> EXIT
                    </button>
                </footer>
            </div>

            {/* CHAT & SETTINGS BAR */}
            <aside className="game-sidebar">
                {/* Settings bar */}
                <div className="global-settings-bar">
                    <button className="icon-btn-global" title="Language">
                        <Languages size={20} />
                    </button>
                    <button className="icon-btn-global" title="How to play">
                        <HelpCircle size={20} />
                    </button>
                    <button
                        className={`icon-btn-global ${isChatOpen ? 'active-link' : ''}`}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        title="Open chat"
                    >
                        <MessageSquare size={20} />
                    </button>
                    <button className="icon-btn-global" title="Settings">
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
                            <div className="message received">Difficulty: {settings.difficulty}</div>
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
                        <h2>Are you sure?</h2>
                        <p>If you leave now, the game will count as a <strong>loss</strong>.</p>
                        <div className="modal-buttons">
                            <button className="btn-confirm-exit" onClick={() => navigate('/menu')}>
                                YES, EXIT AND LOSE
                            </button>
                            <button className="btn-cancel" onClick={() => setShowExitConfirmation(false)}>
                                BACK TO THE GAME
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;