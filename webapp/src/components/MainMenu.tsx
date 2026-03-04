import React, { useState } from 'react';
import { Languages, Settings, User } from 'lucide-react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import HowToPlay from '../components/HowToPlay/HowToPlay';
import { ProfileOverlay } from '../components/UserProfile/ProfileOverlay';

const MainMenu: React.FC = () => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false); /* State to manage HowToPlay visibility */
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const handleStartGame = (level: string) => {
    setShowPlayOptions(false);
    navigate('/game');
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
        </div>

        <h1 className="title-game">game y</h1>

        <div className="grid-buttons">
          <button className="main-button btn-blue full-width" onClick={() => setShowPlayOptions(true)}>
            PLAY
          </button>

          {/* Trigger the HowToPlay modal by setting the state to true */}
          <button className="main-button" onClick={() => setShowHowTo(true)}>
            HOW TO PLAY
          </button>

          <button className="main-button">
            OVERALL RANKING
          </button>
        </div>

    {/* Game options modal - Click outside disabled */}
        {showPlayOptions && (
          <div className="modal-overlay"> 
            {/* Here we removed the onClick from the overlay to prevent closing by mistake */}
            <div className="modal-content">
              {/* The only way to close is this X button */}
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

        {/* Conditional rendering for the HowToPlay component based on state */}
        {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}

        {/* Profile overlay controlled by avatar button */}
        <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
};

export default MainMenu;