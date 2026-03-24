import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Trophy, XCircle, Calendar, Hash, Cpu } from 'lucide-react'; 
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from '../../i18n/useTranslation'; 
import './HistoryPage.css'; 

const HistoryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { t } = useI18n(); 
    const { colorBlindMode, neonMode } = useSettings(); 

    // TEST DATA - In a real app, this would come from an API or local storage
    const matches = [
        { id: 1, date: '2024-03-20', result: 'win', size: '5x5', opponent: 'Bot Chip' },
        { id: 2, date: '2024-03-19', result: 'lose', size: '7x7', opponent: 'Bot Robot' },
        { id: 3, date: '2024-03-18', result: 'win', size: '5x5', opponent: 'Bot Chip' },
    ];

    return (
        <div className={`history-container ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}>
            <header className="history-header">
                <button className="icon-btn-back" onClick={() => navigate('/menu')}>
                    <ArrowLeft size={30} /> 
                </button>
                <h1 className="title-game">{t.buttons.history || "HISTORY"}</h1>
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
                                <Cpu size={16} /> <span>VS {match.opponent}</span>
                            </div>
                        </div>

                        <div className="card-stats">
                            <div className="stat-badge">
                                <Hash size={14} /> {match.size}
                            </div>
                            <div className={`result-text ${match.result}`}>
                                {match.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default HistoryPage;