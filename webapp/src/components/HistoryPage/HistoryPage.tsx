// UBICACIÓN: webapp/src/pages/HistoryPage/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Trophy, XCircle, Calendar, Hash, Cpu, BarChart3, Target } from 'lucide-react'; 
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from '../../i18n/useTranslation'; 
import './HistoryPage.css'; 

const HistoryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { t } = useI18n(); 
    // Extraemos playSound para manejar el efecto de sonido al salir
    const { colorBlindMode, neonMode, playSound } = useSettings(); 

    // REAL (Data Base) DATA
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
                const currentUser = localStorage.getItem('username'); // Get the current user
                
                if (!currentUser) return;

                // Connect to the database
                const res = await fetch(`${API_URL}/matches/user/${currentUser}`);
                const data = await res.json();

                if (res.ok) {
                    // TRANSLATOR: Fit the DTO data to the format the html needs
                    const formattedMatches = data.map((m: any, index: number) => {
                        return {
                            id: m.id || index,
                            date: m.ended_at ? new Date(m.ended_at).toISOString().split('T')[0] : '2024-04-08',
                            result: m.winner_id === currentUser ? 'win' : 'lose',
                            size: '11x11', // Como el backend no guarda el tamaño, ponemos el estándar
                            opponent: m.isBot ? `Bot ${m.botDifficulty === 2 ? 'Hard' : 'Easy'}` : (m.bluePlayerId === currentUser ? m.redPlayerId : m.bluePlayerId)
                        };
                    });
                    
                    setMatches(formattedMatches); // We save the matches with the new format
                }
            } catch (err) {
                console.error("Error de conexión:", err);
            }
        };

        fetchHistory();
    }, []);


    const totalMatches = matches.length; 
    const wins = matches.filter(m => m.result === 'win').length; 
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0; 

    return (
        <div className={`history-container ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}>
            <header className="history-header">
                <h1 className="title-game">{t.buttons.history}</h1>
                <button 
                    className="icon-btn-back" 
                    onClick={() => {
                        playSound('click.mp3'); // Reproduce el sonido antes de navegar
                        navigate('/menu');
                    }}
                >
                    <ArrowLeft size={35} /> 
                </button>
            </header>

            <section className="history-stats">
                <div className="stat-card-mini">
                    <BarChart3 size={20} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">PARTIDAS</span>
                        <span className="stat-value">{totalMatches}</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <Target size={20} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">WIN RATE</span>
                        <span className="stat-value">{winRate}%</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <Trophy size={20} className="stat-icon win" />
                    <div className="stat-info">
                        <span className="stat-label">VICTORIAS</span>
                        <span className="stat-value">{wins}</span>
                    </div>
                </div>
            </section>

            <main className="history-list">
                {matches.map((match) => (
                    <div key={match.id} className={`history-card ${match.result}`}>
                        <div className="card-status-icon">
                            {match.result === 'win' ? 
                                <Trophy size={32} className="icon-win" /> : 
                                <XCircle size={32} className="icon-lose" />
                            }
                        </div>
                        
                        <div className="card-details">
                            <div className="detail-row">
                                <Calendar size={16} /> <span>{match.date}</span>
                            </div>
                            <div className="detail-row">
                                <Cpu size={16} /> <span>{t.labels.vs} {match.opponent}</span>
                            </div>
                        </div>

                        <div className="card-stats">
                            <div className="stat-badge">
                                <Hash size={14} /> {match.size}
                            </div>
                            <div className={`result-text ${match.result}`}>
                                {match.result === 'win' ? t.buttons.victory : t.buttons.defeat}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default HistoryPage;