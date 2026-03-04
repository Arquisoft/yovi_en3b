import React from 'react';
import { X } from 'lucide-react';
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <X size={40} />
        </button>
        
        <h2 className="modal-title">how to play</h2>
        
        <div className="instructions-body">
          <h3 className="section-title">GAME RULES</h3>
          <ul>
            <li><strong>Objective:</strong> Conquer as much territory as possible.</li>
            <li><strong>Movement:</strong> Click on your pieces to move them to adjacent tiles.</li>
          </ul>

          <h3 className="section-title">RESTRICTIONS</h3>
          <ul>
            <li>You cannot move through walls or obstacles.</li>
            <li>You cannot skip your turn.</li>
          </ul>
        </div>

        <button className="main-button btn-blue understood-btn" onClick={onClose}>
          UNDERSTOOD
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;