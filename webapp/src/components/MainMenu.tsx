import React, { useState } from 'react';
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';
import  GamePreviewModal  from '../components/GamePreviewModal/GamePreviewModal';
import '../App.css';

const MainMenu: React.FC = () => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 

  const navigate = useNavigate();

  const handleStartGame = (settings: any) => {
    setShowPlayOptions(false);
    navigate('/game', { state: settings }); 
  };

  return (
    <div className="App">
      <div className="menu-container">
        <div className="header-icons">
          <button className="icon-btn" title="Language"><Languages size={28} /></button>
          <button className="icon-btn" title="Settings"><Settings size={28} /></button>
          <button className="icon-btn" title="Profile" onClick={() => setProfileOpen(true)}><User size={28} /></button>
          <button className="icon-btn" title="Logout" onClick={() => setShowLogoutConfirm(true)}><LogOut size={28} /></button>
        </div>

        <h1 className="title-game">game y</h1>

        <div className="grid-buttons">
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>PLAY</button>
          <button className="main-button" onClick={() => setShowHowTo(true)}>HOW TO PLAY</button>
          <button className="main-button">RANKING</button>
        </div>

        {/* --- MODALES --- */}
        <GamePreviewModal 
          isOpen={showPlayOptions} 
          onClose={() => setShowPlayOptions(false)} 
          onStart={handleStartGame} 
        />

        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="boton-cerrar-fijo" onClick={() => setShowLogoutConfirm(false)}>&times;</button>
              <h2 className="modal-title">EXIT</h2>
              <p className="modal-text">Are you sure you want to log out?</p>
              <div className="modal-grid">
                <button className="opt-btn" style={{ background: '#7f1d1d' }} onClick={() => navigate('/')}>YES, LOGOUT</button>
                <button className="opt-btn" onClick={() => setShowLogoutConfirm(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}

        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
};

export default MainMenu;