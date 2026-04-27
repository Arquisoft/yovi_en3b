// UBICACIÓN: webapp/src/pages/HistoryPage/HistoryPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, XCircle, Calendar, Gauge, BarChart3, Target } from 'lucide-react';
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
                const history = await getMyMatchHistory();
                if (!cancelled) setMatches(history);
            } catch (fetchError) {
                if (!cancelled) setError('Could not load history');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Lógica simplificada: si no es 'win', es 'lose' (por abandono o derrota real)
    const processedMatches = useMemo(() => {
        return matches
            //.filter(m => m.status === 'finished')
            .map(m => ({
                ...m,
                result: m.result === 'win' ? 'win' : 'lose'
            }));
    }, [matches]);

    const totalMatches = processedMatches.length;
    const wins = processedMatches.filter(m => m.result === 'win').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const formatMatchDate = (value: string) => new Date(value).toLocaleDateString('en-CA');

    const getResultLabel = (result: string) => {
        return result === 'win' ? t.buttons.victory : t.buttons.defeat;
    };

    const getDifficultyStyle = (opponent: string) => {
        const lowerName = opponent.toLowerCase();
        if (lowerName.includes('easy')) return { label: 'Easy', className: 'diff-easy' };
        if (lowerName.includes('medium')) return { label: 'Medium', className: 'diff-medium' };
        if (lowerName.includes('hard')) return { label: 'Hard', className: 'diff-hard' };
        return { label: opponent, className: '' };
    };

    return (
        <div className={`history-container ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}>
            <header className="history-header">
                <h1 className="title-game">{t.buttons.history}</h1>
                <button className="icon-btn-back" onClick={() => { playSound('click.mp3'); navigate('/menu'); }}>
                    <ArrowLeft size={35} />
                </button>
            </header>

            <section className="history-stats">
                <div className="stat-card-mini">
                    <BarChart3 size={20} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">{t.labels.partidas}</span>
                        <span className="stat-value">{totalMatches}</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <Target size={20} className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">{t.labels.winRate}</span>
                        <span className="stat-value">{winRate}%</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <Trophy size={20} className="stat-icon win" />
                    <div className="stat-info">
                        <span className="stat-label">{t.labels.victorias}</span>
                        <span className="stat-value">{wins}</span>
                    </div>
                </div>
            </section>

            <main className="history-list">
                {loading && <div className="history-feedback">{t.labels.loadingH}</div>}
                {!loading && error && <div className="history-feedback history-feedback-error">{error}</div>}
                {!loading && !error && processedMatches.length === 0 && (
                    <div className="history-feedback">{t.labels.noMatches}</div>
                )}

                {!loading && !error && processedMatches.map((match) => (
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
                                <Gauge size={16} /> <span className={`difficulty-badge ${getDifficultyStyle(match.opponent).className}`}>
                                    {getDifficultyStyle(match.opponent).label}
                                </span>
                            </div>
                        </div>

                        <div className="card-stats">
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