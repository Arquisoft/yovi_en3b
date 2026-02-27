import React, { useState } from 'react';
import { Languages, MessageSquare, Settings, User } from 'lucide-react'; // Importamos iconos
import '../App.css'; 
import { ProfileOverlay } from '../features/profile/ProfileOverlay';

const MainMenu: React.FC = () => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="App">
      <div className="menu-container">
        <div className="header-icons">
          {/* Iconos de librería estandarizados */}
          <button className="icon-btn" title="Language"><Languages size={28} /></button>
          <button className="icon-btn" title="Chat"><MessageSquare size={28} /></button>
          <button className="icon-btn" title="Settings"><Settings size={28} /></button>
          <button
            className="icon-btn"
            title="Profile"
            onClick={() => setProfileOpen(true)}
          >
            <User size={28} />
          </button>
        </div>

        <h1 className="title-game">game y</h1>

        <div className="grid-buttons">
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>
              PLAY
          </button>
          
          <button className="main-button">
              HOW TO PLAY
          </button>

          <button className="main-button">
              OVERALL RANKING
          </button>
        </div>

        {/* MODAL DE OPCIONES DE JUEGO */}
        {showPlayOptions && (
          <div className="modal-overlay" onClick={() => setShowPlayOptions(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowPlayOptions(false)}>&times;</button>
              <h2 className="modal-title">Select Level</h2>
              <div className="modal-grid">
                <button className="opt-btn"> EASY</button>
                <button className="opt-btn"> MEDIUM</button>
                <button className="opt-btn"> HARD</button>
              </div>
            </div>
          </div>
        )}

        {/* profile overlay controlled by avatar button */}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
};

export default MainMenu;