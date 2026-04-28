// UBICACIÓN: webapp/src/pages/GameScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Languages, Undo2, CheckCircle2, LogOut, MessageSquare, Cpu, Bot,
    Volume2, VolumeX // Added volume icons
} from 'lucide-react';
import './GameScreen.css';
import { generateBoard, type Cell } from './gridUtils';
import { checkWin, boardToYen } from './yGameLogic';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageDialog } from '../LanguageDialog/LanguageDialog';
import { useI18n } from '../../i18n/useTranslation';
import { useSettings } from '../../context/SettingsContext';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import { createMatch, finishMatch, evaluateBoard, getBotMove } from './game.api';
import { requestBotChatReply } from './gameyChat.api';
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
    // Added confirmMove from settings context
    const { colorBlindMode, playSound, isMuted, setIsMuted, confirmMove } = useSettings(); 

    const {
        size = 5,
        time: initialTime = null,
        botType = 'robot',
        difficulty = 0
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
    const [messages, setMessages] = useState<{ sender: 'player' | 'bot', text: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [matchId, setMatchId] = useState<string | null>(null);
    const [matchError, setMatchError] = useState<string | null>(null);
    const [scoreHistory, setScoreHistory] = useState<ScoreData[]>([]);
    const lastEvaluatedTurn = useRef(0);

    const p1Color = colorBlindMode ? '#f59e0b' : '#60a5fa';
    const p2Color = colorBlindMode ? '#ffffff' : '#ef4444';

    // 3. API Handlers (Init & Finish)
    useEffect(() => {
        const initMatch = async () => {
            try {
                // Asegúrate de que difficulty tenga un valor por defecto si es undefined
                const diffValue = difficulty !== undefined ? difficulty : 1;
                const m = await createMatch(true, diffValue); // Enviamos el valor asegurado
                setMatchId(m.id);
            } catch (e) { console.error(e); }
        };
        initMatch();
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
                    if (gameResult === 'win') playSound('win.mp3');
                    else playSound('gameover.mp3');
                  
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Failed to finish match';
                    console.error('Match finish error:', msg);
                    setMatchError(msg);
                }
            };
            
            finishGameMatch();
        }
    }, [gameResult, matchId, playSound]);

    // Effect to evaluate board tension after every move
    useEffect(() => {
        const turnCount = Object.keys(boardState).length;
        
        // 1. Si el tablero está vacío o el juego terminó, paramos.
        if (turnCount === 0 || gameResult) return;
        
        // 2. EL CANDADO: Si ya hemos evaluado este turno exacto, paramos.
        if (lastEvaluatedTurn.current === turnCount) return;

        // 3. Cerramos el candado para este turno
        lastEvaluatedTurn.current = turnCount;

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
                // Si falla, abrimos el candado para que pueda reintentarlo luego
                lastEvaluatedTurn.current = turnCount - 1; 
            }
        };

        evaluateCurrentBoard();
    }, [boardState, size, gameResult]);


    const formatDisplayTime = (seconds: number | null) => {
        if (seconds === null) return "∞";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const userMessage = inputValue.trim();
        playSound('click.mp3'); 
        setMessages(prev => [...prev, { sender: 'player', text: userMessage }]);
        setInputValue('');

        try {
            const difficultyMap = ['easy', 'medium', 'hard'] as const;
            const reply = await requestBotChatReply({
                messages: [...messages, { sender: 'player', text: userMessage }],
                difficulty: difficultyMap[difficulty] ?? 'medium',
                botId: 'robot',
                size: size,
                currentPlayer: 1,
                boardState
            });
            setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Connection error. Please try again.' }]);
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

    // Internal execution logic to avoid code duplication
    const executeMove = (cell: Cell) => {
        if (gameResult) return;
        playSound('place-tile.mp3'); 

        // Saves in the history of moves (for the undo)
        setHistory(prev => [...prev, boardState]);

        // Allows the undo button from being pressed
        setCanUndo(true);

        const key = `${cell.x}-${cell.y}-${cell.z}`;

        const newBoardState = { ...boardState, [key]: 1 };
        setBoardState(newBoardState);
        setPendingMove(null);

        if (checkWin(newBoardState, 1, size, cells)) {
            setGameResult('win');
            return;
        }

        setCurrentPlayer(2);
        setBotCooldown(true);
        setTimeout(async () => {
            try {
                const yenLayout = boardToYen(newBoardState, size);
                const turnCount = Object.keys(newBoardState).length;
                const position = JSON.stringify({
                    size,
                    turn: turnCount,
                    players: ["B", "R"],
                    layout: yenLayout
                });
                // Map difficulty to botId
                let botId = 'random_bot';
                if (difficulty === 0) botId = 'easy_bot';
                else if (difficulty === 1) botId = 'medium_bot';
                else if (difficulty === 2) botId = 'hard_bot';
                const coords = await getBotMove(position, botId);
                const botKey = `${coords.x}-${coords.y}-${coords.z}`;
                const afterBot = { ...newBoardState, [botKey]: 2 };
                setBoardState(afterBot);
                playSound('place-tile.mp3');
                if (checkWin(afterBot, 2, size, cells)) setGameResult('lose');
            } catch (error) {
                console.error("Error getting bot move:", error);
                // Fallback to random
                const available = cells.filter(c => !newBoardState[`${c.x}-${c.y}-${c.z}`]);
                if (available.length > 0) {
                    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % available.length;
                    const botCell = available[randomIndex];
                    const botKey = `${botCell.x}-${botCell.y}-${botCell.z}`;
                    const afterBot = { ...newBoardState, [botKey]: 2 };
                    setBoardState(afterBot);
                    playSound('place-tile.mp3');
                    if (checkWin(afterBot, 2, size, cells)) setGameResult('lose');
                }
            }
            setCurrentPlayer(1);
            setBotCooldown(false);
        }, 1200);
    };

    const handleClick = (cell: Cell) => {
        const key = `${cell.x}-${cell.y}-${cell.z}`;
        if (gameResult || botCooldown || boardState[key]) return;

        if (confirmMove) {
            playSound('click.mp3'); 
            setPendingMove(cell);
        } else {
            executeMove(cell);
        }
    };

    const handleConfirm = () => {
        if (!pendingMove || gameResult) return;
        executeMove(pendingMove);
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
        lastEvaluatedTurn.current = 0;
        navigate('/menu', { state: { openConfig: true } });
    };

    console.log("Historial de Tensión Actual:", scoreHistory);

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
                    {confirmMove && (
                        <button className="game-action-btn btn-confirm-action" onClick={handleConfirm} disabled={!pendingMove || botCooldown}>
                            <CheckCircle2 size={18} /> <span>{t.buttons.confirm}</span>
                        </button>
                    )}
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
                                <div 
                                    key={index} 
                                    className={msg.sender === 'player' ? 'message sent' : 'message received'}
                                    style={msg.sender === 'player' ? { backgroundColor: p1Color } : { backgroundColor: '#333', color: '#fff' }}
                                >
                                    {msg.text}
                                </div>
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