import React, { useState } from 'react';
/* Added LogOut icon to the import */
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/useTranslation';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import { LanguageDialog } from '../components/LanguageDialog/LanguageDialog';

const MainMenu: React.FC = () => {
  const { t, language } = useI18n();
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  /* State to manage the Logout confirmation modal */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 

  const navigate = useNavigate();

  const handleStartGame = () => {
    setShowPlayOptions(false);
    navigate('/game');
  };

  /* Function to handle the final logout */
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/'); /* Takes the user back to the login page */
  };

  return (
    <div className="App">
      <div className="menu-container">
        <div className="header-icons">
          <button 
            className="icon-btn" 
            title={t.buttons.language}
            onClick={() => setShowLanguageDialog(true)}
          >
            <Languages size={28} />
          </button>
          <button className="icon-btn" title={t.buttons.settings}><Settings size={28} /></button>
          <button
            className="icon-btn"
            title={t.buttons.profile}
            onClick={() => setProfileOpen(true)}
          >
            <User size={28} />
          </button>
          {/* New Logout Button */}
          <button 
            className="icon-btn" 
            title={t.buttons.logout}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={28} />
          </button>
        </div>

        <h1 className="title-game">game y</h1>

        <div className="grid-buttons">
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>
            {t.buttons.play}
          </button>
          <button className="main-button" onClick={() => setShowHowTo(true)}>
            {t.buttons.howToPlay}
          </button>
          <button className="main-button">
            {t.buttons.overallRanking}
          </button>
        </div>

        {/* Game options modal */}
        {showPlayOptions && (
          <div className="modal-overlay"> 
            <div className="modal-content">
              <button className="boton-cerrar-fijo" onClick={() => setShowPlayOptions(false)}>&times;</button>
              <h2 className="modal-title">{t.labels.selectLevel}</h2>
              <div className="modal-grid">
                <button className="opt-btn" onClick={() => handleStartGame()}>{t.buttons.easy}</button>
                <button className="opt-btn" onClick={() => handleStartGame()}>{t.buttons.medium}</button>
                <button className="opt-btn" onClick={() => handleStartGame()}>{t.buttons.hard}</button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal - Matches aesthetic and click-outside behavior */}
        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="boton-cerrar-fijo" onClick={() => setShowLogoutConfirm(false)}>&times;</button>
              <h2 className="modal-title">{t.buttons.exit}</h2>
              <p className="modal-text">
                {language === 'es' ? '¿Seguro que quieres cerrar sesión?' : 'Are you sure you want to log out?'}
              </p>
              <div className="modal-grid">
                <button className="opt-btn" style={{ background: '#7f1d1d' }} onClick={handleConfirmLogout}>
                  {language === 'es' ? 'SÍ, CERRAR SESIÓN' : 'YES, LOGOUT'}
                </button>
                <button className="opt-btn" onClick={() => setShowLogoutConfirm(false)}>
                  {t.buttons.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
        <LanguageDialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} />
      </div>
    </div>
  );
};

export default MainMenu;