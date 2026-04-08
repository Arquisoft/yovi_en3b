// UBICACIÓN: webapp/src/pages/MainMenu.tsx
import React, { useState, useEffect } from 'react'; // React hooks
import { Languages, Settings, User, LogOut } from 'lucide-react'; // Icons
import { useNavigate, useLocation } from 'react-router-dom'; // Navigation hooks
import { useI18n } from '../i18n/useTranslation'; // Translation hook
import { useSettings } from '../context/SettingsContext'; // Settings context
import HowToPlay from '../components/HowToPlay/HowToPlay'; // How to play component
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay'; // Profile overlay
import GamePreviewModal from '../components/GamePreviewModal/GamePreviewModal'; // Game preview modal
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog'; // Language dialog
import SettingsModal from '../components/Settings/SettingsModal'; // Settings modal
import RankingScreen from '../components/RankingScreen/RankingScreen'; // Ranking screen
import '../App.css'; // Global styles

const MOCK_RANKING_DATA = [
  { id: '1', username: 'NeonKnight', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', points: 2500, winRate: 85, gamesPlayed: 100, lastGameWon: true },
  { id: '2', username: 'CyberGhost', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', points: 2100, winRate: 72, gamesPlayed: 90, lastGameWon: false },
  { id: '3', username: 'RetroPlayer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', points: 1950, winRate: 65, gamesPlayed: 85, lastGameWon: true },
  { id: '4', username: 'User_404', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', points: 1200, winRate: 45, gamesPlayed: 50, lastGameWon: false },
];

const MainMenu: React.FC = () => {
  const { t } = useI18n(); // Translation function
  const { colorBlindMode, playSound } = useSettings(); // Settings state
  const [showPlayOptions, setShowPlayOptions] = useState(false); // Modal state
  const [showHowTo, setShowHowTo] = useState(false); // How to play state
  const [profileOpen, setProfileOpen] = useState(false); // Profile state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // Logout state
  const [languageOpen, setLanguageOpen] = useState(false); // Language state
  const [showSettings, setShowSettings] = useState(false); // Settings state
  const [showRanking, setShowRanking] = useState(false); // Ranking state

  const navigate = useNavigate(); // Navigation function
  const location = useLocation(); // Location object to read state

  useEffect(() => {
    if (location.state?.openConfig) {
      setShowPlayOptions(true); // Open the preview modal if requested
      window.history.replaceState({}, document.title); // Reset the state to avoid re-opening
    }
  }, [location.state]); // Effect depends on location changes

  const handleMenuAction = (action: () => void) => {
    playSound('click.mp3'); // Play click sound
    action(); // Run the action
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
                    playSound('click.mp3'); // Sound feedback
                    navigate('/'); // Go to login
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
            playSound('click.mp3'); // Sound feedback
            setShowPlayOptions(false); // Close modal
            navigate('/game', { state: settings }); // Navigate to game with settings
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