import React from 'react';
import { MousePointer2, Target, Trophy, Youtube } from 'lucide-react';
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void; // Function to close the modal
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      {/* Background click disabled for safety */}
      <div className="modal-content how-to-play-modal">
        {/* Fixed X button for closing */}
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">HOW TO PLAY</h2>
        
        {/* Compact board container */}
        <div className="board-container">
          <div className="triangle-frame">
            {/* Row 1 */}
            <div className="balls-row">
              <div className="ball red"></div> {/* Top piece of the triangle */}
            </div>
            {/* Row 2 */}
            <div className="balls-row">
              <div className="ball blue"></div>
              <div className="ball red"></div> {/* Middle pieces */}
            </div>
            {/* Row 3 */}
            <div className="balls-row">
              <div className="ball red"></div>
              <div className="ball blue"></div>
              <div className="ball red"></div> {/* Bottom pieces */}
            </div>
          </div>
        </div>

        <div className="instructions-list">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon"><MousePointer2 size={20} /></div>
            <div className="step-text">
              <h3>The Choice</h3>
              <p>One player places a piece. The second player then chooses to either keep that move and play that color, or play the second move with the other color.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon"><Target size={20} /></div>
            <div className="step-text">
              <h3>Connection</h3>
              <p>On your turn, place one piece of your color on any intersection. Your goal is to create a single unbroken line of your pieces.</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon"><Trophy size={20} /></div>
            <div className="step-text">
              <h3>The "Y" Goal</h3>
              <p>To win, your path must connect all three sides of the triangular board. Corners count as part of both sides they touch!</p>
            </div>
          </div>
        </div>

        {/* Video Tutorial Section */}
        <div className="video-resource">
          <p className="confirm-text" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>WANT TO SEE IT IN ACTION?</p>
          <a 
            href="https://youtu.be/eDGei98yBtY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link-btn"
          >
            <Youtube size={20} color="#ff0000" />
            <span>Watch Gameplay & Tutorial</span>
          </a>
        </div>

        <button className="understood-btn btn-blue" onClick={onClose} style={{ marginTop: '20px' }}>
          UNDERSTOOD
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;