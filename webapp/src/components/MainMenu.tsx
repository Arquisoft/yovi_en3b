// UBICACIÓN: webapp/src/pages/MainMenu.tsx
import React, { useState } from 'react';
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/useTranslation';
import { useSettings } from '../context/SettingsContext'; 
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import GamePreviewModal from '../components/GamePreviewModal/GamePreviewModal';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';
import SettingsModal from '../components/Settings/SettingsModal';
import RankingScreen from '../components/RankingScreen/RankingScreen'; 
import '../App.css';

// MOCK DATA
const MOCK_RANKING_DATA = [
  { id: '1', username: 'NeonKnight', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', points: 2500, winRate: 85, gamesPlayed: 100, lastGameWon: true },
  { id: '2', username: 'CyberGhost', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', points: 2100, winRate: 72, gamesPlayed: 90, lastGameWon: false },
  { id: '3', username: 'RetroPlayer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', points: 1950, winRate: 65, gamesPlayed: 85, lastGameWon: true },
  { id: '4', username: 'User_404', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', points: 1200, winRate: 45, gamesPlayed: 50, lastGameWon: false },
];

const MainMenu: React.FC = () => {
  const { t } = useI18n();
  const { colorBlindMode, playSound } = useSettings(); // Access playSound from settings context
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  const navigate = useNavigate();

  // Helper function to handle clicks and sounds
  const handleMenuAction = (action: () => void) => {
    playSound('click.mp3'); // Play feedback sound
    action(); // Execute the specific state change
  };

  return (
    <div className={`App ${colorBlindMode ? 'color-blind' : ''}`}>
      <div className="menu-container">
        <div className="header-icons">
          <button className="icon-btn" title={t.buttons.language} onClick={() => handleMenuAction(() => setLanguageOpen(true))}>
            <Languages size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.settings} onClick={() => handleMenuAction(() => setShowSettings(true))}>
            <Settings size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.profile} onClick={() => handleMenuAction(() => setProfileOpen(true))}>
            <User size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.logout} onClick={() => handleMenuAction(() => setShowLogoutConfirm(true))}>
            <LogOut size={28} />
          </button>
        </div>

        <h1 className="title-game">GAME Y</h1>

        <div className="grid-buttons">
          <button 
            className={`main-button full-width ${colorBlindMode ? 'btn-orange' : 'btn-blue'}`} 
            onClick={() => handleMenuAction(() => setShowPlayOptions(true))}
          >
            {t.buttons.play} 
          </button>
          
          <button className="main-button" onClick={() => handleMenuAction(() => setShowHowTo(true))}>
            {t.buttons.howToPlay}
          </button>
          
          <button className="main-button" onClick={() => handleMenuAction(() => setShowRanking(true))}>
            {t.buttons.overallRanking}
          </button>
        </div>

        {/* --- MODAL COMPONENTS --- */}

        {showRanking && (
          <div className="modal-overlay"> 
            <RankingScreen 
              users={MOCK_RANKING_DATA} 
              onClose={() => setShowRanking(false)} 
            />
          </div>
        )}

        <LanguageDialog open={languageOpen} onClose={() => setLanguageOpen(false)} />

        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => handleMenuAction(() => setShowLogoutConfirm(false))}>
            <div className={`modal-content ${colorBlindMode ? 'color-blind' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className="boton-cerrar-fijo" onClick={() => handleMenuAction(() => setShowLogoutConfirm(false))}>&times;</button>
              <h2 className="modal-title">{t.buttons.logout}</h2>
              <p className="modal-text">
                {t.messages.logoutConfirmation}
              </p>
              <div className="modal-grid">
                <button 
                  className="opt-btn btn-danger" 
                  onClick={() => {
                    playSound('click.mp3'); // Sound feedback on logout
                    navigate('/');
                  }}
                >
                  {t.buttons.confirmLogout}
                </button>
                <button className="opt-btn active" onClick={() => handleMenuAction(() => setShowLogoutConfirm(false))}>
                  {t.buttons.stayHere}
                </button>
              </div>
            </div>
          </div>
        )}

        <GamePreviewModal 
          isOpen={showPlayOptions} 
          onClose={() => setShowPlayOptions(false)} 
          onStart={(settings) => { 
            playSound('click.mp3'); // Sound when starting a game
            setShowPlayOptions(false); 
            navigate('/game', { state: settings }); 
          }} 
        />
        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default MainMenu;