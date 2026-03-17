// UBICACIÓN: webapp/src/components/GamePreviewModal/GamePreviewModal.tsx
import React, { useState } from 'react';
import { useI18n } from '../../i18n/useTranslation'; 
import { Bot, Cpu } from 'lucide-react'; 
import './GamePreviewModal.css';

interface GamePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: any) => void;
}

const GamePreviewModal: React.FC<GamePreviewProps> = ({ isOpen, onClose, onStart }) => {
  const { t } = useI18n(); 
  const [boardSize, setBoardSize] = useState(5);
  const [difficulty, setDifficulty] = useState(1);
  const [selectedBot, setSelectedBot] = useState(0);

  if (!isOpen) return null;

  const totalCells = (boardSize * (boardSize + 1)) / 2;
  
  const calculateSeconds = () => {
    if (difficulty === 0) return null;
    return difficulty === 1 ? (totalCells * 3) * 3 : (totalCells * 3) * 2;
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return t.labels.noLimit;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} ${t.labels.minutesShort}`;
  };

  const renderTriangle = () => {
    const rows = [];
    for (let i = 0; i < boardSize; i++) {
      const dots = [];
      for (let j = 0; j <= i; j++) {
        dots.push(<div key={`${i}-${j}`} className="triangle-cell"></div>);
      }
      rows.push(
        <div key={i} className="triangle-row">
          {dots}
        </div>
      );
    }
    return <div className="triangle-wrapper">{rows}</div>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        <h2 className="modal-title h2-preview-title">{t.labels.preview}</h2>

        <div className="preview-layout">
          <div className="preview-left-column">
            <p className="p-time-limit-top">{t.labels.timeLimit}: {formatTime(calculateSeconds())}</p>
            
            {/* Renderizado del tablero */}
            <div className="visual-preview-area">
               {renderTriangle()}
            </div>
          </div>

          <div className="preview-right-column">
            <div className="setting-control">
              <label className="label-white-bold">{t.labels.opponent}</label>
              <div className="bot-selector">
                <button 
                  className={`bot-btn ${selectedBot === 0 ? 'active' : ''}`} 
                  onClick={() => setSelectedBot(0)}
                >
                  <Bot size={48} color={selectedBot === 0 ? "#60a5fa" : "#fff"} />
                </button>
                <button 
                  className={`bot-btn ${selectedBot === 1 ? 'active' : ''}`} 
                  onClick={() => setSelectedBot(1)}
                >
                  <Cpu size={48} color={selectedBot === 1 ? "#60a5fa" : "#fff"} />
                </button>
              </div>
            </div>

            <div className="setting-control">
              <label className="label-white-bold">{t.labels.difficulty}</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                value={difficulty} 
                onChange={(e) => setDifficulty(parseInt(e.target.value))} 
                className="neon-slider" 
              />
              <div className="slider-labels-below">
                <span className={difficulty === 0 ? 'active' : ''}>{t.labels.easy}</span>
                <span className={difficulty === 1 ? 'active' : ''}>{t.labels.medium}</span>
                <span className={difficulty === 2 ? 'active' : ''}>{t.labels.hard}</span>
              </div>
            </div>

            <div className="setting-control">
              <label className="label-white-bold">{t.labels.boardSize}</label>
              <div className="stepper-horizontal">
                <button className="step-btn" onClick={() => setBoardSize(Math.max(3, boardSize - 1))}>-</button>
                <span className="stepper-value">{boardSize}</span>
                <button className="step-btn" onClick={() => setBoardSize(Math.min(10, boardSize + 1))}>+</button>
              </div>
            </div>

            <button 
              className="main-button btn-blue" 
              onClick={() => onStart({ size: boardSize, difficulty, bot: selectedBot, time: calculateSeconds() })}
            >
              {t.buttons.playNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePreviewModal;