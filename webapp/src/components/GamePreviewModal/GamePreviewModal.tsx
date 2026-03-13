import React, { useState, useMemo } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: { size: number; difficulty: string; time: number | null }) => void;
}

const GamePreviewModal: React.FC<Props> = ({ isOpen, onClose, onStart }) => {
  const [size, setSize] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'difficult'>('medium');

  const timeLimit = useMemo(() => {
    const numCells = (size * (size + 1)) / 2;
    const botMoveTime = 3;
    if (difficulty === 'easy') return null;
    if (difficulty === 'medium') return numCells * botMoveTime * 3;
    return numCells * botMoveTime * 2;
  }, [size, difficulty]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content preview-modal-wide">
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        <h2 className="modal-title">PREVIEW</h2>

        <div className="preview-layout">
          <div className="preview-left-board">
            {/* Visual Board Mockup based on Size */}
            <div className="triangle-mockup">
               <p style={{color: 'var(--game-blue)'}}>Board Size: {size}x{size}</p>
            </div>
          </div>

          <div className="preview-right-settings">
            <div className="bots-section">
              <div className="bot-avatar bot-orange"></div>
              <div className="bot-avatar bot-teal"></div>
            </div>

            <div className="setting-control">
              <label>DIFFICULTY: <span style={{color: 'var(--game-blue)'}}>{difficulty.toUpperCase()}</span></label>
              <input 
                type="range" min="1" max="3" step="1" defaultValue="2"
                onChange={(e) => {
                  const v = e.target.value;
                  setDifficulty(v==="1" ? "easy" : v==="2" ? "medium" : "difficult");
                }}
                className="difficulty-slider"
              />
            </div>

            <div className="setting-control size-box">
              <label>BOARD SIZE:</label>
              <input 
                type="number" min="3" max="10" value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="size-number-input"
              />
            </div>

            <p>{timeLimit ? `TIME LIMIT: ${timeLimit}s` : "NO TIME LIMIT"}</p>

            <button className="btn-play-now" onClick={() => onStart({ size, difficulty, time: timeLimit })}>
              PLAY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePreviewModal;