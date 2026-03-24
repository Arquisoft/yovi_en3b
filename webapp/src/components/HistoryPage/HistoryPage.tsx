import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Trophy, XCircle, Calendar, Hash, Cpu } from 'lucide-react'; // Added icons
import { useSettings } from '../../context/SettingsContext'; // Settings hook
import { useI18n } from '../../i18n/useTranslation'; // Translation hook
import './HistoryPage.css'; 

const HistoryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { t } = useI18n(); 
    const { colorBlindMode, neonMode } = useSettings(); 

    // MOCK DATA for visual testing
    const matches = [
        { id: 1, date: '2024-03-20', result: 'win', size: '5x5', opponent: 'Bot Chip' },
        { id: 2, date: '2024-03-19', result: 'lose', size: '7x7', opponent: 'Bot Robot' },
        { id: 3, date: '2024-03-18', result: 'win', size: '5x5', opponent: 'Bot Chip' },
    ];

    return (
        <div className={`history-container ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}>
            <header className="history-header">
                {/* Title first for left alignment */}
                <h1 className="title-game">{t.buttons.history}</h1>
                
                {/* Back button second for right alignment */}
                <button className="icon-btn-back" onClick={() => navigate('/menu')}>
                    <ArrowLeft size={35} /> 
                </button>
            </header>

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