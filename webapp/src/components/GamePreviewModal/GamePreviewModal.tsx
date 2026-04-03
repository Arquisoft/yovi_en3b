// UBICACIÓN: webapp/src/components/GamePreviewModal/GamePreviewModal.tsx
import React, { useState } from 'react';
import { useI18n } from '../../i18n/useTranslation'; 
import { useSettings } from '../../context/SettingsContext'; // Importamos el contexto de ajustes
import { Bot, Cpu } from 'lucide-react'; 
import './GamePreviewModal.css';

interface GamePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: any) => void;
}

const GamePreviewModal: React.FC<GamePreviewProps> = ({ isOpen, onClose, onStart }) => {
  const { t } = useI18n(); 
  const { colorBlindMode } = useSettings(); // Obtenemos el estado daltónico
  const [boardSize, setBoardSize] = useState(5);
  const [difficulty, setDifficulty] = useState(1);
  const [selectedBot, setSelectedBot] = useState(0);

  if (!isOpen) return null;

  // El color de acento ahora se maneja principalmente por CSS, 
  // pero lo usamos aquí para los iconos de Lucide-React.
  const accentColor = colorBlindMode ? "#f59e0b" : "#60a5fa";

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
    <div className="preview-modal-overlay" onClick={onClose}>
      {/* Añadimos la clase color-blind condicionalmente aquí */}
      <div 
        className={`preview-modal-content preview-modal-wide ${colorBlindMode ? 'color-blind' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="preview-close-btn" onClick={onClose}>&times;</button>
        <h2 className="preview-modal-title">{t.labels.preview}</h2>

        <div className="preview-layout">
          <div className="preview-left-column">
            <p className="p-time-limit-top">{t.labels.timeLimit}: {formatTime(calculateSeconds())}</p>
            
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
                  <Bot size={48} color={selectedBot === 0 ? accentColor : "#fff"} />
                </button>
                <button 
                  className={`bot-btn ${selectedBot === 1 ? 'active' : ''}`} 
                  onClick={() => setSelectedBot(1)}
                >
                  <Cpu size={48} color={selectedBot === 1 ? accentColor : "#fff"} />
                </button>
              </div>
            </div>

            <div className="setting-control">
  <label className="label-white-bold">{t.labels.difficulty}</label>
  <div className="difficulty-slider-container">
    <input 
      type="range" 
      min="0" 
      max="2" 
      value={difficulty} 
      onChange={(e) => setDifficulty(parseInt(e.target.value))} 
      className="neon-slider" 
    />
    <div className="slider-labels-below">
      <span className={difficulty === 0 ? 'active' : ''}>{t.buttons.easy}</span>
      <span className={difficulty === 1 ? 'active' : ''}>{t.buttons.medium}</span>
      <span className={difficulty === 2 ? 'active' : ''}>{t.buttons.hard}</span>
    </div>
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
              className="preview-play-btn" 
              onClick={() => onStart({ 
                size: boardSize, 
                difficulty, 
                botType: selectedBot === 0 ? 'robot' : 'chip', 
                time: calculateSeconds() 
              })}
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
