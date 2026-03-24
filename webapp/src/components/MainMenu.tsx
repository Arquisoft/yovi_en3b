// UBICACIÓN: webapp/src/pages/MainMenu.tsx
import React, { useState } from 'react';
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/useTranslation';
import { useSettings } from '../context/SettingsContext'; // Importamos el contexto
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import GamePreviewModal from '../components/GamePreviewModal/GamePreviewModal';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';
import SettingsModal from '../components/Settings/SettingsModal';
import '../App.css';

const MainMenu: React.FC = () => {
  const { t } = useI18n();
  const { colorBlindMode } = useSettings(); // Obtenemos el estado daltónico
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const navigate = useNavigate();

  return (
    <div className={`App ${colorBlindMode ? 'color-blind' : ''}`}>
      <div className="menu-container">
        <div className="header-icons">
          <button className="icon-btn" title={t.buttons.language} onClick={() => setLanguageOpen(true)}>
            <Languages size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.settings} onClick={() => setShowSettings(true)}>
            <Settings size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.profile} onClick={() => setProfileOpen(true)}>
            <User size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.logout} onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={28} />
          </button>
        </div>

        <h1 className="title-game">GAME Y</h1>

        <div className="grid-buttons">
          {/* El botón PLAY ahora cambia de clase según el modo */}
          <button 
            className={`main-button full-width ${colorBlindMode ? 'btn-orange' : 'btn-blue'}`} 
            onClick={() => setShowPlayOptions(true)}
          >
            {t.buttons.play} 
          </button>
          
          <button className="main-button" onClick={() => setShowHowTo(true)}>
            {t.buttons.howToPlay}
          </button>
          
          <button className="main-button">
            {t.buttons.overallRanking}
          </button>
        </div>

        <LanguageDialog open={languageOpen} onClose={() => setLanguageOpen(false)} />

        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className={`modal-content ${colorBlindMode ? 'color-blind' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className="boton-cerrar-fijo" onClick={() => setShowLogoutConfirm(false)}>&times;</button>
              <h2 className="modal-title">{t.buttons.logout}</h2>
              <p className="modal-text">
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
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default MainMenu;