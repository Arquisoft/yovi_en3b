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
import { useNavigate } from 'react-router-dom';

const GameScreen: React.FC = () => {
    const navigate = useNavigate();

    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);

    return (
        <div className="game-layout">
            {/* LEFT PART -> Board & Buttons */}
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`}>
                        PLAYER 1
                    </div>
                    <span className="vs-text">vs.</span>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`}>
                        PLAYER 2
                    </div>
                </header>

                <main className="board-area">
                    <div className="triangle-board">
                        <div className="placeholder-text">Board goes here</div>
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
                                    <span className="user-name">PLAYER 2</span>
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
                        <h2>Are you sure?</h2>
                        <p>If you leave now, the game will count as a <strong>loss</strong>.</p>

                        <div className="modal-buttons">
                            <button className="btn-confirm-exit" onClick={() => navigate('/')}>
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