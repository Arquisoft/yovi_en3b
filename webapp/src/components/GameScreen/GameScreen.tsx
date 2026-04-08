// UBICACIÓN: webapp/src/pages/GameScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot,
    Volume2, VolumeX // Added volume icons
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

const GameScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useI18n();
    const { colorBlindMode, playSound, isMuted, setIsMuted } = useSettings(); // Added isMuted and setIsMuted

    const {
        size = 5,
        time: initialTime = null,
        botType = 'robot',
        difficulty = 1  // Add difficulty extraction
    } = location.state || {};

    const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);
    const [cells] = useState(generateBoard(size));
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [boardState, setBoardState] = useState<Record<string, number>>({});
    const [history, setHistory] = useState<Record<string, number>[]>([]);  // History for "Undo" button
    const [canUndo, setCanUndo] = useState(false);  // To deactivate the undo button once it is clicked
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [pendingMove, setPendingMove] = useState<Cell | null>(null);
    const [botCooldown, setBotCooldown] = useState(false);
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [matchId, setMatchId] = useState<string | null>(null);
    const [isMatchCreating, setIsMatchCreating] = useState(false);
    const [matchError, setMatchError] = useState<string | null>(null);
    

    const p1Color = colorBlindMode ? '#f59e0b' : '#60a5fa';
    const p2Color = colorBlindMode ? '#ffffff' : '#ef4444';

    // Effect to create match on component mount
    useEffect(() => {
        if (isMatchCreating || matchId) return;
        if (!localStorage.getItem('userId')) return;
        
        const createGameMatch = async () => {
            setIsMatchCreating(true);
            try {
                const match = await createMatch(
                    true, // isBot=true (playing against bot)
                    difficulty || 1 // use the actual difficulty (1=easy, 2=medium, 3=hard)
                );
                setMatchId(match.id);
                setMatchError(null);
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Failed to create match';
                console.error('Match creation error:', msg);
                setMatchError(msg);
            } finally {
                setIsMatchCreating(false);
            }
        };
        
        createGameMatch();
    }, [difficulty]);

    // Effect to trigger game over sounds and finish match
    useEffect(() => {
        if (gameResult === 'win') playSound('win.mp3');
        if (gameResult === 'lose') playSound('gameover.mp3');
        
        // Finish the match when game ends
        if (gameResult && matchId) {
            const finishGameMatch = async () => {
                try {
                    const userId = localStorage.getItem('userId');
                    if (!userId) {
                        console.error('User ID not found');
                        return;
                    }
                    
                    const winnerId = gameResult === 'win' ? userId : 'bot';
                    await finishMatch(matchId, winnerId);
                    console.log(`Match finished with result: ${gameResult}`);
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Failed to finish match';
                    console.error('Match finish error:', msg);
                    setMatchError(msg);
                }
            };
            
            finishGameMatch();
        }
    }, [gameResult, matchId, playSound]);

    const formatDisplayTime = (seconds: number | null) => {
        if (seconds === null) return "∞";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        playSound('click.mp3'); 
        setMessages(prev => [...prev, { sender: 'player', text: inputValue.trim() }]);
        setInputValue('');
    };

    useEffect(() => {
        if (timeLeft === null || gameResult) return;
        if (timeLeft <= 0) {
            setGameResult('lose');
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameResult]);

    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`;
        if (gameResult || botCooldown || boardState[key]) return;
        playSound('click.mp3'); 
        setPendingMove(cell);
    };

    const handleConfirm = () => {
        if (!pendingMove || gameResult) return;
        playSound('place-tile.mp3'); 

        // Saves in the history of moves (for the undo)
        setHistory(prev => [...prev, boardState]);

        // Allows the undo button from being pressed
        setCanUndo(true);

        const key = `${pendingMove.x}-${pendingMove.y}-${pendingMove.z}`;

        const newBoardState = { ...boardState, [key]: 1 };
        setBoardState(newBoardState);
        setPendingMove(null);

        if (checkWin(newBoardState, 1, size, cells)) {
            setGameResult('win');
            return;
        }

        setCurrentPlayer(2);
        setBotCooldown(true);
        setTimeout(() => {
            const availableCells = cells.filter(c => !newBoardState[`${c.x}-${c.y}-${c.z}`]);
            if (availableCells.length > 0) {
                const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
                const botKey = `${randomCell.x}-${randomCell.y}-${randomCell.z}`;
                const stateAfterBot = { ...newBoardState, [botKey]: 2 };
                
                playSound('place-tile.mp3'); 
                setBoardState(stateAfterBot);

                if (checkWin(stateAfterBot, 2, size, cells)) {
                    setGameResult('lose');
                }
            }
            setCurrentPlayer(1);
            setBotCooldown(false);
        }, 1200);
    };

    const handleUndo = () => {
        if (history.length === 0 || botCooldown) return;

        playSound('click.mp3');

        // Get the previous save state
        const previousState = history[history.length - 1];

        // Update the board
        setBoardState(previousState);

        // Delete from the history that move
        setHistory(prev => prev.slice(0, -1));

        // Clean any pending move
        setPendingMove(null);

        // Blocks the button from being clicked on
        setCanUndo(false);
    }

    const restartGame = () => {
        playSound('click.mp3');
        setBoardState({});
        setHistory([]);
        setGameResult(null);
        setCurrentPlayer(1);
        setTimeLeft(initialTime);
        setMatchId(null); // Reset match ID for new game
        navigate('/menu', { state: { openConfig: true } });
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
                                    const key = `${cell.x}-${cell.y}-${cell.z}`;
                                    const owner = boardState[key];
                                    const isSelected = pendingMove?.x === cell.x && pendingMove?.y === cell.y && pendingMove?.z === cell.z;
                                    return (
                                        <Hexagon
                                            key={key} q={cell.q} r={cell.r} s={cell.s}
                                            className={`hex-cell ${owner === 1 ? 'p1-selected' : ''} ${owner === 2 ? 'p2-selected' : ''} ${isSelected ? 'pending-selection' : ''}`}
                                            style={{
                                                fill: owner === 1 ? p1Color : (owner === 2 ? p2Color : ''),
                                                stroke: isSelected ? p1Color : ''
                                            }}
                                            onClick={() => handleClick(cell)}
                                        />
                                    );
                                })}
                            </Layout>
                        </HexGrid>
                    </div>
                </main>

                <footer className="game-footer">
                    <button 
                        className="game-action-btn" 
                        onClick={handleUndo}
                        disabled ={history.length === 0 || botCooldown || !canUndo}
                        >
                            <Undo2 size={18} /> 
                            <span>{t.buttons.undo}</span>
                    </button>
                    <button className="game-action-btn btn-confirm-action" onClick={handleConfirm} disabled={!pendingMove || botCooldown}>
                        <CheckCircle2 size={18} /> <span>{t.buttons.confirm}</span>
                    </button>
                    <button className="game-action-btn btn-exit-footer" onClick={() => { playSound('click.mp3'); setShowExitConfirmation(true); }}>
                        <LogOut size={18} /> <span>{t.buttons.exit}</span>
                    </button>
                </footer>
            </div>

            <aside className="game-sidebar">
                <div className="global-settings-bar">
                    {/* New Mute/Unmute button for background music */}
                    <button 
                        title={isMuted ? "Unmute" : "Mute"} 
                        className="icon-btn-global" 
                        onClick={() => {
                            playSound('click.mp3'); // UI feedback still plays
                            setIsMuted(!isMuted); // Toggle global music mute
                        }}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button title="Language" className="icon-btn-global" onClick={() => { playSound('click.mp3'); setShowLanguageDialog(true); }}><Languages size={20} /></button>
                    <button title="Chat" className="icon-btn-global" onClick={() => { playSound('click.mp3'); setIsChatOpen(!isChatOpen); }}><MessageSquare size={20} /></button>
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
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t.labels.typeMessage}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!inputValue.trim()} style={{ backgroundColor: p1Color }}>
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
                        <p className="result-modal-text">
                            {gameResult === 'win' ? t.messages.winDetail : t.messages.loseDetail}
                        </p>
                        {matchError && (
                            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>
                                {matchError}
                            </p>
                        )}
                        <div className="modal-buttons-column">
                            <button className={`main-button ${colorBlindMode ? 'btn-orange' : 'btn-blue'}`} onClick={restartGame}>{t.buttons.playAgain}</button>
                            <button className="main-button btn-red-outline" onClick={() => { playSound('click.mp3'); navigate('/menu'); }}>{t.buttons.mainMenu}</button>
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
                            <button className="main-button btn-red" onClick={() => { playSound('click.mp3'); navigate('/menu'); }}>{t.buttons.yesExitAndLose}</button>
                            <button className={`main-button ${colorBlindMode ? 'btn-orange-outline' : 'btn-blue-outline'}`} onClick={() => { playSound('click.mp3'); setShowExitConfirmation(false); }}>{t.buttons.backToGame}</button>
                        </div>
                    </div>
                </div>
            )}
            <LanguageDialog open={showLanguageDialog} onClose={() => { playSound('click.mp3'); setShowLanguageDialog(false); }} />
        </div>
    );
};

export default GameScreen;
