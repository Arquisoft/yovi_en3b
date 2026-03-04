import React from 'react';
import { X, Target, Puzzle, Layers } from 'lucide-react'; // Icons for the steps
import './HowToPlay.css'; // Importing the specific styles

interface HowToPlayProps { onClose: () => void; } // Component props interface

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const steps = [
    { icon: <Layers />, title: "PLACING PIECES", desc: "Select your color and place pieces on the triangular board." },
    { icon: <Puzzle />, title: "STRATEGY", desc: "Connect your pieces while blocking your opponent's path." },
    { icon: <Target />, title: "OBJECTIVE", desc: "Be the first to complete the required pattern to win." }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Full screen background overlay */}
      <div className="modal-content how-to-play-modal" onClick={(e) => e.stopPropagation()}> {/* Modal container */}
        <button className="close-modal" onClick={onClose}><X size={35} /></button> {/* Close icon button */}
        
        <h2 className="modal-title cubic-text">HOW TO PLAY</h2> {/* Main title in Cubic font */}

        <div className="board-container"> {/* Container for the board visual */}
          <div className="triangle-frame">
            <div className="balls-row row-1"><div className="ball red"></div></div>
            <div className="balls-row row-2"><div className="ball blue"></div><div className="ball blue"></div></div>
            <div className="balls-row row-3"><div className="ball red"></div><div className="ball red"></div><div className="ball red"></div></div>
            <div className="balls-row row-4"><div className="ball blue"></div><div className="ball blue"></div><div className="ball blue"></div><div className="ball blue"></div></div>
          </div>
        </div>

        <div className="instructions-list"> {/* Vertical list of tutorial steps */}
          {steps.map((s, i) => (
            <div key={i} className="step-card"> {/* Individual instruction card */}
              <div className="step-number">{i + 1}</div> {/* Number badge for the step */}
              <div className="step-icon">{s.icon}</div> {/* Icon for the step */}
              <div className="step-text">
                <h3 className="orbitron-text">{s.title}</h3> {/* Step title in Orbitron */}
                <p className="orbitron-text">{s.desc}</p> {/* Step description in Orbitron */}
              </div>
            </div>
          ))}
        </div>

        {/* Updated button with Orbitron and specific alignment classes */}
        <button className="main-button btn-blue understood-btn orbitron-text" onClick={onClose}>
          UNDERSTOOD
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;