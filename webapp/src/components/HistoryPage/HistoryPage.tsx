import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Trophy, XCircle, Calendar, Hash, Cpu, BarChart3, Target } from 'lucide-react'; // Added Chart and Target icons
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from '../../i18n/useTranslation'; 
import './HistoryPage.css'; 

const HistoryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { t } = useI18n(); 
    const { colorBlindMode, neonMode } = useSettings(); 

    // MOCK DATA
    const matches = [
        { id: 1, date: '2024-03-20', result: 'win', size: '5x5', opponent: 'Bot Chip' },
        { id: 2, date: '2024-03-19', result: 'lose', size: '7x7', opponent: 'Bot Robot' },
        { id: 3, date: '2024-03-18', result: 'win', size: '5x5', opponent: 'Bot Chip' },
        { id: 4, date: '2024-03-17', result: 'win', size: '6x6', opponent: 'Bot Tech' },
    ];

    // Lógica de Estadísticas
    const totalMatches = matches.length; // Cuenta el total de partidas
    const wins = matches.filter(m => m.result === 'win').length; // Filtra y cuenta victorias
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0; // Calcula %

    return (
        <div className={`history-container ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}>
            <header className="history-header">
                <h1 className="title-game">{t.buttons.history}</h1>
                <button className="icon-btn-back" onClick={() => navigate('/menu')}>
                    <ArrowLeft size={35} /> 
                </button>
            </header>

            {/* Nueva Sección de Estadísticas */}
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