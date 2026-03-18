
import React, { useState } from 'react';
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/useTranslation'; // Importamos el hook global
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import GamePreviewModal from '../components/GamePreviewModal/GamePreviewModal';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';
import '../App.css';

const MainMenu: React.FC = () => {
  const { t } = useI18n(); // Accedemos a las traducciones
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 
  const [languageOpen, setLanguageOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="App">
      <div className="menu-container">
        <div className="header-icons">
          <button className="icon-btn" title={t.buttons.language} onClick={() => setLanguageOpen(true)}>
            <Languages size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.settings}><Settings size={28} /></button>
          <button className="icon-btn" title={t.buttons.profile} onClick={() => setProfileOpen(true)}>
            <User size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.logout} onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={28} />
          </button>
        </div>

        <h1 className="title-game">GAME Y</h1>

        <div className="grid-buttons">
          {/* Usamos t.buttons.play en lugar de "PLAY" */}
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>
            {t.buttons.play} 
          </button>
          {/* Usamos t.buttons.howToPlay en lugar de "HOW TO PLAY" */}
          <button className="main-button" onClick={() => setShowHowTo(true)}>
            {t.buttons.howToPlay}
          </button>
          {/* Usamos t.buttons.overallRanking en lugar de "RANKING" */}
          <button className="main-button">
            {t.buttons.overallRanking}
          </button>
        </div>

        <LanguageDialog open={languageOpen} onClose={() => setLanguageOpen(false)} />

        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="boton-cerrar-fijo" onClick={() => setShowLogoutConfirm(false)}>&times;</button>
              <h2 className="modal-title">{t.buttons.logout}</h2>
              <p className="modal-text" style={{ color: 'white', opacity: 0.9 }}>
                {t.messages.logoutConfirmation}
              </p>
              <div className="modal-grid">
                <button className="opt-btn btn-danger" onClick={() => navigate('/')}>
                  {t.buttons.confirmLogout}
                </button>
                <button className="opt-btn active" onClick={() => setShowLogoutConfirm(false)}>
                  {t.buttons.stayHere}
                </button>
              </div>
            </div>
          </div>
        )}

        <GamePreviewModal 
          isOpen={showPlayOptions} 
          onClose={() => setShowPlayOptions(false)} 
          onStart={(settings) => { setShowPlayOptions(false); navigate('/game', { state: settings }); }} 
        />
        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
};

export default MainMenu;