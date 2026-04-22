// UBICACIÓN: webapp/src/pages/GameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot,
    Volume2, VolumeX
} from 'lucide-react';
import './GameScreen.css';
import { generateBoard, type Cell } from './gridUtils';
import { checkWin, boardToYen } from './yGameLogic';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageDialog } from '../LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';
import { useSettings } from '../../context/SettingsContext';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import { requestBotChatReply, type GameChatMessage } from './gameyChat.api';
import { createMatch, finishMatch } from './game.api';
import { createMatch, finishMatch, evaluateBoard } from './game.api';
import TutorBot from '../TutorBox/TutorBox';
import { MatchGraph } from './MatchGraph';

export interface ScoreData {
    turn: number;
    blue: number;
    red: number;
}

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
    const [messages, setMessages] = useState<GameChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [matchId, setMatchId] = useState<string | null>(null);
    const [isMatchCreating, setIsMatchCreating] = useState(false);
    const [matchError, setMatchError] = useState<string | null>(null);
    const chatMessagesRef = useRef<HTMLDivElement | null>(null);
    
    // --- ESTADOS TUTOR ---
    const [tutorMessage, setTutorMessage] = useState<string | null>(null);
    const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
    const [tutorMessagesCount, setTutorMessagesCount] = useState(0);
    const [movesSinceLastTip, setMovesSinceLastTip] = useState(0);

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

    const mapDifficulty = (level: number): 'easy' | 'medium' | 'hard' => {
        if (level <= 0) return 'easy';
        if (level >= 2) return 'hard';
        return 'medium';
    };

    const mapBotId = (_type: string): string => {
        // Map frontend bot types to backend bot IDs
        return 'llm_bot'; // Use the registered llm_bot for all bot types
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        playSound('click.mp3'); 
        const playerText = inputValue.trim();
        const nextMessages: GameChatMessage[] = [...messages, { sender: 'player', text: playerText }];
        setMessages(nextMessages);
    // Effect to evaluate board tension after every move
    useEffect(() => {
        const turnCount = Object.keys(boardState).length;

        // If the game just started or already ended, we dont sent anything
        if (turnCount === 0 || gameResult) return;
        // If we've already evaluated this turn, we dont send anything
        if (lastEvaluatedTurn.current === turnCount) return;

        // Mark this turn as evalueated...
        lastEvaluatedTurn.current = turnCount;
        // ...and then we evaluate it
        const evaluateCurrentBoard = async () => {
            try {
                const yenLayoutString = boardToYen(boardState, size);

                const payload = {
                    size: size,
                    turn: turnCount,
                    players: ["B", "R"],
                    layout: yenLayoutString
                };

                const data = await evaluateBoard(payload);

                setScoreHistory(prev => [
                    ...prev,
                    { turn: turnCount, blue: data.blue_score, red: data.red_score }
                ]);
            } catch (error) {
                console.error("Error evaluating board tension:", error);
                // If something fails, we mark it as unchecked again
                lastEvaluatedTurn.current = turnCount - 1;
            }
        };

        evaluateCurrentBoard();
    }, [boardState, size, gameResult]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        playSound('click.mp3');
        setMessages((prev: any[]) => [...prev, { sender: 'player', text: inputValue.trim() }]);
        setInputValue('');

        try {
            setIsBotTyping(true);
            const reply = await requestBotChatReply({
                size,
                currentPlayer,
                boardState,
                messages: nextMessages,
                difficulty: mapDifficulty(difficulty),
                botId: mapBotId(botType),
            });
            const replyText = typeof reply === 'string' && reply.trim().length > 0
                ? reply.trim()
                : 'I cannot answer right now. Try again in a moment.';
            setMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
        } catch (error) {
            const fallbackMessage = 'I cannot answer right now. Try again in a moment.';
            const errorMessage = error instanceof Error ? error.message.trim() : '';

            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: errorMessage || fallbackMessage },
            ]);
        } finally {
            setIsBotTyping(false);
        }
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
    // 4. Lógica de Deshacer (Undo)
    const handleUndo = () => {
        if (!canUndo || history.length === 0 || botCooldown || gameResult) return;

    useEffect(() => {
        const chatMessages = chatMessagesRef.current;
        if (!chatMessages) return;

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, [messages, isBotTyping]);

    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`;
        if (gameResult || botCooldown || boardState[key]) return;
        playSound('click.mp3'); 
        setPendingMove(cell);
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
                const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % available.length;
                const botCell = available[randomIndex];
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

    // Keep the board visible for all configured board sizes (3..10)
    // by scaling the SVG viewBox and hex size with `size`.
    const gridViewSize = Math.max(100, size * 24);
    const gridViewStart = -gridViewSize / 2;
    const hexSize = Math.max(3, Math.min(6, 30 / size));
    const gridOrigin = {
        x: size * 4.75 * (hexSize / 6),
        y: (size - 1) * 5 * (hexSize / 6),
    };

    console.log("Historial de Tensión Actual:", scoreHistory);

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
                        <HexGrid
                            width="100%"
                            height="100%"
                            viewBox={`${gridViewStart} ${gridViewStart} ${gridViewSize} ${gridViewSize}`}
                        >
                            <Layout size={{ x: hexSize, y: hexSize }} flat={false} spacing={1.08} origin={gridOrigin}>
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
                    <button
                        className="icon-btn-global"
                        title="Mute" // Opcional para otros tests
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    <button
                        className="icon-btn-global"
                        title="Language"
                        onClick={() => setShowLanguageDialog(true)}
                    >
                        <Languages size={20} />
                    </button>

                    <button
                        className="icon-btn-global"
                        title="Chat"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>
                {isChatOpen && (
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="bot-profile-badge">
                                <div className="bot-avatar-circle">{botType === 'chip' ? <Cpu size={20} /> : <Bot size={20} />}</div>
                                <div className="bot-info-text"><span className="bot-name-chat">PLAYER 2</span><span className="bot-status-tag">Online</span></div>
                            </div>
                        </div>
                        <div className="chat-messages" ref={chatMessagesRef}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender === 'player' ? 'sent' : 'received'}`}
                                    style={msg.sender === 'player' ? { backgroundColor: p1Color } : undefined}
                                >
                        <div className="chat-messages-display" style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {messages.map((msg, index) => (
                                <div key={index} className={`chat-bubble ${msg.sender}`} style={{
                                    alignSelf: msg.sender === 'player' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.sender === 'player' ? p1Color : '#333',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    fontSize: '0.9rem'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                            {isBotTyping && <div className="message received">...</div>}
                        </div>
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
                                data-testid="chat-send-button"
                                disabled={!inputValue.trim() || isBotTyping}
                                style={{ backgroundColor: p1Color }}
                            >
                                <CheckCircle2 size={18} />
                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribe un mensaje..."
                            />
                            <button type="submit" className="send-btn">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </aside>

            {/* MODALS */}
            {gameResult && (
                <div className="modal-overlay">
                    <div className={`modal-content result-modal ${colorBlindMode ? 'color-blind' : ''}`}>

                        <MatchGraph data={scoreHistory} />

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
