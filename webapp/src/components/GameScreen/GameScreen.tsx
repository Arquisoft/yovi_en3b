import React, { useState, useEffect } from 'react';
import {
    Languages,
    Settings,
    X,
    Undo2,
    Lightbulb,
    CheckCircle2,
    LogOut,
    MessageSquare,
    HelpCircle,
    Clock
} from 'lucide-react';
import './GameScreen.css';
import { useNavigate, useLocation } from 'react-router-dom';

const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get settings from navigation state (Size, Time, Difficulty)
    const settings = location.state || { size: 10, difficulty: 'medium', time: 300 };

    const [currentPlayer, _setCurrentPlayer] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(settings.time);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <div className="game-layout">
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}>PLAYER 1</div>
                    <div className="game-timer-display">
                        {timeLeft !== null ? (
                            <div className={`timer-box ${timeLeft < 10 ? 'critical' : ''}`}>
                                <Clock size={20} /> <span>{timeLeft}s</span>
                            </div>
                        ) : <span className="vs-text">vs.</span>}
                    </div>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}>PLAYER 2</div>
                </header>

                <main className="board-area">
                    <div className="triangle-board">
                        <div className="placeholder-text">BOARD SIZE: {settings.size}x{settings.size}</div>
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

            <aside className="game-sidebar">
                <div className="global-settings-bar">
                    <button className="icon-btn-global"><Languages size={20} /></button>
                    <button className="icon-btn-global"><HelpCircle size={20} /></button>
                    <button className={`icon-btn-global ${isChatOpen ? 'active-link' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)}>
                        <MessageSquare size={20} />
                    </button>
                    <button className="icon-btn-global"><Settings size={20} /></button>
                </div>

                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <div className="avatar-circle">P2</div>
                                <div className="user-details"><span className="user-name">PLAYER 2</span><span className="status-online">Online</span></div>
                            </div>
                            <button className="icon-btn-chat" onClick={() => setIsChatOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="chat-messages">
                            <div className="message received">Good luck! Size: {settings.size}</div>
                        </div>
                        <div className="chat-input-wrapper">
                            <input type="text" placeholder="..." className="chat-input-field" />
                            <button className="send-confirm-btn">✓</button>
                        </div>
                    </div>
                )}
            </aside>

            {showExitConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Are you sure?</h2>
                        <p>If you leave now, you will lose the game.</p>
                        <div className="modal-grid">
                            <button className="opt-btn" style={{ background: '#7f1d1d' }} onClick={() => navigate('/menu')}>YES, EXIT</button>
                            <button className="opt-btn" onClick={() => setShowExitConfirmation(false)}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;