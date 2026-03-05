import React, { useState } from 'react';
/* Added LogOut icon to the import */
import { Languages, Settings, User, LogOut } from 'lucide-react'; 
import '../App.css';
import { useNavigate } from 'react-router-dom';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';

const MainMenu: React.FC = () => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  /* State to manage the Logout confirmation modal */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 

  const navigate = useNavigate();

  const handleStartGame = (level: string) => {
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
          <button className="icon-btn" title="Language"><Languages size={28} /></button>
          <button className="icon-btn" title="Settings"><Settings size={28} /></button>
          <button
            className="icon-btn"
            title="Profile"
            onClick={() => setProfileOpen(true)}
          >
            <User size={28} />
          </button>
          {/* New Logout Button */}
          <button 
            className="icon-btn" 
            title="Logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={28} />
          </button>
        </div>

        <h1 className="title-game">game y</h1>

        <div className="grid-buttons">
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>
            PLAY
          </button>
          <button className="main-button" onClick={() => setShowHowTo(true)}>
            HOW TO PLAY
          </button>
          <button className="main-button">
            OVERALL RANKING
          </button>
        </div>

        {/* Game options modal */}
        {showPlayOptions && (
          <div className="modal-overlay"> 
            <div className="modal-content">
              <button className="boton-cerrar-fijo" onClick={() => setShowPlayOptions(false)}>&times;</button>
              <h2 className="modal-title">Select Level</h2>
              <div className="modal-grid">
                <button className="opt-btn" onClick={() => handleStartGame('easy')}> EASY</button>
                <button className="opt-btn" onClick={() => handleStartGame('medium')}> MEDIUM</button>
                <button className="opt-btn" onClick={() => handleStartGame('hard')}> HARD</button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal - Matches aesthetic and click-outside behavior */}
        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="boton-cerrar-fijo" onClick={() => setShowLogoutConfirm(false)}>&times;</button>
              <h2 className="modal-title">EXIT</h2>
              <p className="modal-text">
                Are you sure you want to log out?
              </p>
              <div className="modal-grid">
                <button className="opt-btn" style={{ background: '#7f1d1d' }} onClick={handleConfirmLogout}>
                  YES, LOGOUT
                </button>
                <button className="opt-btn" onClick={() => setShowLogoutConfirm(false)}>
                  CANCEL
                </button>
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