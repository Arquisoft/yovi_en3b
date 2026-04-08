// UBICACIÓN: webapp/src/components/Ranking/RankingScreen.tsx
import React from 'react';
import { useI18n } from '../../i18n/useTranslation';
import { X, Trophy, Medal, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react'; 
import { useSettings } from '../../context/SettingsContext'; // Import settings context for audio
import './RankingScreen.css';

interface RankingUser {
  id: string;
  username: string;
  avatar: string;
  points: number;
  winRate: number;
  gamesPlayed: number;
  lastGameWon: boolean;
}

interface RankingScreenProps {
  onClose: () => void;
  users: RankingUser[];
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onClose, users }) => {
  const { t } = useI18n();
  const { playSound } = useSettings(); // Hook to access global playSound function

  const renderRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="rank-icon gold" size={24} />;
    if (index === 1) return <Medal className="rank-icon silver" size={24} />;
    if (index === 2) return <Medal className="rank-icon bronze" size={24} />;
    return <span className="rank-number">{index + 1}</span>; 
  };

  return (
    <div className="ranking-layout">
      <div className="ranking-container">
        {/* EXIT BUTTON WITH INTEGRATED SOUND */}
        <button 
          className="ranking-exit-btn" 
          onClick={() => {
            playSound('click.mp3'); // Play click sound before closing
            onClose(); // Trigger the close callback
          }} 
          aria-label="Close"
        >
         <X size={68} color="white" strokeWidth={3} />
        </button>

        <h1 className="title-game ranking-title">
          {t.labels.rankingTitle || 'RANKING GLOBAL'}
        </h1>

        <div className="ranking-table-header">
          <span className="col-rank-label">{t.labels.position || 'POSICIÓN'}</span>
          <span className="col-user-label">{t.labels.user || 'USUARIO'}</span>
          <div className="col-header-stats">
            <span>{t.labels.winRate || 'WIN %'}</span>
            <span>{t.labels.lastGame || 'ÚLTIMA PARTIDA'}</span>
          </div>
        </div>

        <div className="ranking-list">
          {users.map((user, index) => (
            <div key={user.id} className={`ranking-item ${index < 3 ? 'top-three' : ''}`}>
              <div className="col-rank">
                {renderRankIcon(index)}
              </div>

              <div className="col-user info-user-cell">
                <img src={user.avatar} alt={user.username} className="ranking-avatar" />
                <span className="ranking-username">{user.username}</span>
              </div>

              <div className="col-stats-container">
                <div className="winrate-value">
                  <Percent size={14} className="stat-icon" />
                  {user.winRate}%
                </div>
                
                <div className={`trend-indicator ${user.lastGameWon ? 'win' : 'loss'}`}>
                  {user.lastGameWon ? (
                    <ArrowUpRight size={22} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={22} strokeWidth={2.5} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankingScreen;