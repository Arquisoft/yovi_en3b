// UBICACIÓN: webapp/src/pages/GameScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot,
    Volume2, VolumeX
} from 'lucide-react';
import './GameScreen.css';
import { generateBoard, type Cell } from './gridUtils';
import { checkWin } from './yGameLogic';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageDialog } from '../LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';
import { useSettings } from '../../context/SettingsContext';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import { createMatch, finishMatch } from './game.api';
import TutorBot from '../TutorBox/TutorBox'; 

const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useI18n();
    const { 
        colorBlindMode, playSound, isMuted, setIsMuted, 
        confirmMove, tutorEnabled 
    } = useSettings();

    const {
        size = 5,
        time: initialTime = null,
        botType = 'robot',
        difficulty = 1
    } = location.state || {};

    // --- ESTADOS PRINCIPALES ---
    const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);
    const [cells] = useState(generateBoard(size));
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [boardState, setBoardState] = useState<Record<string, number>>({});
    const [history, setHistory] = useState<Record<string, number>[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [pendingMove, setPendingMove] = useState<Cell | null>(null);
    const [botCooldown, setBotCooldown] = useState(false);
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
    const [messages] = useState<{ sender: string, text: string }[]>([]);
    //const [inputValue, setInputValue] = useState('');
    const [matchId, setMatchId] = useState<string | null>(null);
    
    // --- ESTADOS TUTOR ---
    const [tutorMessage, setTutorMessage] = useState<string | null>(null);
    const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
    const [tutorMessagesCount, setTutorMessagesCount] = useState(0); 
    const [movesSinceLastTip, setMovesSinceLastTip] = useState(0); 

    const p1Color = colorBlindMode ? '#f59e0b' : '#60a5fa';
    const p2Color = colorBlindMode ? '#ffffff' : '#ef4444';

    // 1. Temporizador del juego
    useEffect(() => {
        if (timeLeft === null || gameResult) return; 
        if (timeLeft <= 0) {
            setGameResult('lose'); 
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null)); 
        }, 1000);
        return () => clearInterval(timer); 
    }, [timeLeft, gameResult]);

    // 2. Lógica del Tutor con Progresión Inteligente
    useEffect(() => {
        if (!tutorEnabled || currentPlayer !== 1 || gameResult || tutorMessage) return; 

        const tutorTimer = setInterval(() => {
            const secondsSinceTurnStart = (Date.now() - turnStartTime) / 1000;
            let conditionMet = false;

            if (tutorMessagesCount === 0) {
                if (secondsSinceTurnStart >= 4) conditionMet = true;
            } else if (tutorMessagesCount === 1) {
                if (movesSinceLastTip >= 1 && secondsSinceTurnStart >= 6) conditionMet = true;
            } else if (tutorMessagesCount === 2) {
                if (movesSinceLastTip >= 2 && secondsSinceTurnStart >= 6) conditionMet = true;
            } else {
                if (secondsSinceTurnStart >= 6) conditionMet = true;
            }

            if (conditionMet) {
                const tips = t.tutor.tips;
                if (tips && tips.length > 0) {
                    const randomIndex = Math.floor(Math.random() * tips.length);
                    setTutorMessage(tips[randomIndex]);
                    setTutorMessagesCount(prev => prev + 1);
                    setMovesSinceLastTip(0); 
                    playSound('notification.mp3');
                }
            }
        }, 1000);

        return () => clearInterval(tutorTimer);
    }, [currentPlayer, turnStartTime, tutorMessage, gameResult, t.tutor.tips, tutorMessagesCount, movesSinceLastTip, tutorEnabled, playSound]);

    // 3. API Handlers (Init & Finish)
    useEffect(() => {
        const initMatch = async () => {
            try {
                const m = await createMatch(true, difficulty); 
                setMatchId(m.id);
            } catch (e) { console.error(e); }
        };
        initMatch();
    }, [difficulty]);

    useEffect(() => {
        if (gameResult && matchId) {
            const userId = localStorage.getItem('userId') || 'player';
            finishMatch(matchId, gameResult === 'win' ? userId : 'bot'); 
            if (gameResult === 'win') playSound('win.mp3');
            else playSound('gameover.mp3');
        }
    }, [gameResult, matchId, playSound]);

    // 4. Lógica de Deshacer (Undo)
    const handleUndo = () => {
        if (!canUndo || history.length === 0 || botCooldown || gameResult) return;

        playSound('click.mp3');
        const previousState = history[history.length - 1]; // Recuperamos el último estado guardado
        
        setBoardState(previousState); // Revertimos el tablero
        setHistory(prev => prev.slice(0, -1)); // Eliminamos el último del historial
        
        if (history.length <= 1) setCanUndo(false);
        
        setPendingMove(null);
        setTutorMessage(null);
        setTurnStartTime(Date.now()); // Reiniciamos reloj para el tutor
    };

    const executeMove = (cell: Cell) => {
        // Guardamos el estado actual en el historial antes de mover
        setHistory(prev => [...prev, boardState]);
        setCanUndo(true);

        const key = `${cell.x}-${cell.y}-${cell.z}`;
        const newBoard = { ...boardState, [key]: 1 };
        
        setMovesSinceLastTip(prev => prev + 1); 
        setTurnStartTime(Date.now()); 
        setTutorMessage(null); 
        setBoardState(newBoard);
        setPendingMove(null);

        if (checkWin(newBoard, 1, size, cells)) {
            setGameResult('win'); 
            return;
        }

        setCurrentPlayer(2);
        setBotCooldown(true);
        setTimeout(() => {
            const available = cells.filter(c => !newBoard[`${c.x}-${c.y}-${c.z}`]);
            if (available.length > 0) {
                const botCell = available[Math.floor(Math.random() * available.length)];
                const botKey = `${botCell.x}-${botCell.y}-${botCell.z}`;
                const afterBot = { ...newBoard, [botKey]: 2 };
                setBoardState(afterBot);
                playSound('place-tile.mp3');
                if (checkWin(afterBot, 2, size, cells)) setGameResult('lose'); 
            }
            setCurrentPlayer(1);
            setBotCooldown(false);
            setTurnStartTime(Date.now()); 
        }, 1200);
    };

    return (
        <div className={`game-layout ${colorBlindMode ? 'color-blind' : ''}`}>
            <div className="game-main-content">
                <header className="game-header">
                    <div className={`player-card p1 ${currentPlayer === 1 ? 'active' : ''}`} style={{ borderColor: currentPlayer === 1 ? p1Color : 'transparent' }}>
                        {t.labels.player1}
                    </div>
                    <div className={`game-timer-wrapper ${timeLeft !== null && timeLeft < 20 ? 'timer-low' : ''}`} style={{ borderColor: p1Color }}>
                        <span className="timer-value" style={{ color: p1Color }}>{formatTime(timeLeft)}</span>
                    </div>
                    <div className={`player-card p2 ${currentPlayer === 2 ? 'active' : ''}`} style={{ borderColor: currentPlayer === 2 ? p2Color : 'transparent' }}>
                        {t.labels.player2}
                    </div>
                </header>

                <main className="board-area" style={{ position: 'relative' }}>
                    <div className="triangle-board">
                        <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
                            <Layout size={{ x: 6, y: 6 }} flat={false} spacing={1.08} origin={{ x: size * 4.75, y: (size - 1) * 5 }}>
                                {cells.map((cell) => {
                                    const key = `${cell.x}-${cell.y}-${cell.z}`;
                                    const owner = boardState[key];
                                    const isSelected = pendingMove?.x === cell.x && pendingMove?.y === cell.y && pendingMove?.z === cell.z;
                                    return (
                                        <Hexagon
                                            key={key} q={cell.q} r={cell.r} s={cell.s}
                                            className={`hex-cell ${owner === 1 ? 'p1-selected' : ''} ${owner === 2 ? 'p2-selected' : ''} ${isSelected ? 'pending-selection' : ''}`}
                                            onClick={() => {
                                                if (gameResult || botCooldown || boardState[key]) return;
                                                if (confirmMove) { setPendingMove(cell); playSound('click.mp3'); }
                                                else { executeMove(cell); playSound('place-tile.mp3'); }
                                            }}
                                        />
                                    );
                                })}
                            </Layout>
                        </HexGrid>
                    </div>
                    <TutorBot message={tutorMessage} onClear={() => setTutorMessage(null)} />
                </main>

                <footer className="game-footer">
                    <button className="game-action-btn" onClick={handleUndo} disabled={!canUndo || botCooldown}>
                        <Undo2 size={18} />
                        <span>{t.buttons.undo}</span>
                    </button>
                    {confirmMove && (
                        <button className="game-action-btn btn-confirm-action" onClick={() => executeMove(pendingMove!)} disabled={!pendingMove || botCooldown}>
                            <CheckCircle2 size={18} />
                            <span>{t.buttons.confirm}</span>
                        </button>
                    )}
                    <button className="game-action-btn btn-exit-footer" onClick={() => setShowExitConfirmation(true)}>
                        <LogOut size={18} />
                        <span>{t.buttons.exit}</span>
                    </button>
                </footer>
            </div>

            <aside className="game-sidebar">
                <div className="global-settings-bar">
                    <button className="icon-btn-global" onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                    <button className="icon-btn-global" onClick={() => setShowLanguageDialog(true)}><Languages size={20} /></button>
                    <button className="icon-btn-global" onClick={() => setIsChatOpen(!isChatOpen)}><MessageSquare size={20} /></button>
                </div>
                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="bot-profile-badge">
                                <div className="bot-avatar-circle">{botType === 'chip' ? <Cpu size={20} /> : <Bot size={20} />}</div>
                                <div className="bot-info-text"><span className="bot-name-chat">PLAYER 2</span><span className="bot-status-tag">Online</span></div>
                            </div>
                        </div>
                        <div className="chat-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className="message sent" style={{ backgroundColor: p1Color }}>{msg.text}</div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* MODALS */}
            {gameResult && (
                <div className="modal-overlay">
                    <div className="modal-content result-modal">
                        <h2 className={gameResult === 'win' ? 'text-win' : 'text-lose'}>{gameResult === 'win' ? t.messages.congrats : t.messages.nextTime}</h2>
                        <p>{gameResult === 'win' ? t.messages.winDetail : t.messages.loseDetail}</p>
                        <button className="main-button btn-blue" onClick={() => navigate('/menu')}>{t.buttons.mainMenu}</button>
                    </div>
                </div>
            )}
            {showExitConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{t.messages.areYouSure}</h2>
                        <button className="main-button btn-red" onClick={() => navigate('/menu')}>{t.buttons.yesExitAndLose}</button>
                        <button className="main-button btn-blue-outline" onClick={() => setShowExitConfirmation(false)}>{t.buttons.backToGame}</button>
                    </div>
                </div>
            )}
            <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} />
        </div>
    );
};

// Helper para formatear tiempo
const formatTime = (s: number | null) => {
    if (s === null) return "∞";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

export default GameScreen;