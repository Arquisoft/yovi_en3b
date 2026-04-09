// UBICACIÓN: webapp/src/pages/HistoryPage/HistoryPage.tsx
import React, { useEffect, useMemo, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Trophy, XCircle, Calendar, Hash, Cpu, BarChart3, Target } from 'lucide-react'; 
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from '../../i18n/useTranslation'; 
import './HistoryPage.css'; 
import { getMyMatchHistory, type MatchHistoryEntry } from './history.api';

const HistoryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { t } = useI18n(); 
    const { colorBlindMode, neonMode, playSound } = useSettings(); 
    const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const history = await getMyMatchHistory();

                if (!cancelled) {
                    setMatches(history);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(fetchError instanceof Error ? fetchError.message : 'Could not load match history');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const finishedMatches = useMemo(
        () => matches.filter((match) => match.result === 'win' || match.result === 'lose'),
        [matches],
    );
    const totalMatches = finishedMatches.length; 
    const wins = finishedMatches.filter(m => m.result === 'win').length; 
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const formatMatchDate = (value: string) =>
        new Date(value).toLocaleDateString('en-CA');

    const formatBoardSize = (size: number | null) => (size ? `${size}x${size}` : '—');

    const getResultLabel = (result: MatchHistoryEntry['result']) => {
        if (result === 'win') return t.buttons.victory;
        if (result === 'lose') return t.buttons.defeat;
        if (result === 'abandoned') return 'ABANDONED';
        return 'IN PROGRESS';
    };

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
                {loading && <div className="history-feedback">Loading history...</div>}
                {!loading && error && <div className="history-feedback history-feedback-error">{error}</div>}
                {!loading && !error && matches.length === 0 && (
                    <div className="history-feedback">No matches recorded yet.</div>
                )}

                {!loading && !error && matches.map((match) => (
                    <div key={match.id} className={`history-card ${match.result}`}>
                        <div className="card-status-icon">
                            {match.result === 'win' ? 
                                <Trophy size={32} className="icon-win" /> : 
                                <XCircle size={32} className="icon-lose" />
                            }
                        </div>
                        
                        <div className="card-details">
                            <div className="detail-row">
                                <Calendar size={16} /> <span>{formatMatchDate(match.date)}</span>
                            </div>
                            <div className="detail-row">
                                <Cpu size={16} /> <span>{t.labels.vs} {match.opponent}</span>
                            </div>
                        </div>

                        <div className="card-stats">
                            <div className="stat-badge">
                                <Hash size={14} /> {formatBoardSize(match.size)}
                            </div>
                            <div className={`result-text ${match.result}`}>
                                {getResultLabel(match.result)}
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default HistoryPage;
