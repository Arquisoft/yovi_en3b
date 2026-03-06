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
import { LanguageDialog } from '../../components/LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';

const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t} = useI18n();
    const [currentPlayer, _setCurrentPlayer] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);

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
                    <div className="triangle-board">
                        <div className="placeholder-text">{t.labels.boardGoesHere}</div>
                    </div>
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn"><Undo2 size={16} /> {t.buttons.undo}</button>
                    <button className="game-action-btn"><Lightbulb size={16} /> {t.buttons.hint}</button>
                    <button className="game-action-btn btn-confirm-blue"><CheckCircle2 size={16} /> {t.buttons.confirm}</button>
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