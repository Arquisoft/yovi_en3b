// UBICACIÓN: webapp/src/components/HowToPlay/HowToPlay.tsx
import React from 'react';
import { MousePointer2, Target, Trophy, Youtube } from 'lucide-react';
import { useI18n } from '../../i18n/useTranslation'; 
import { useSettings } from '../../context/SettingsContext'; // Importamos el hook de ajustes
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const { t } = useI18n(); 
  const { colorBlindMode, playSound } = useSettings(); // Accedemos al modo daltónico y a playSound

  return (
    <div className="modal-overlay">
      {/* Añadimos la clase color-blind condicionalmente */}
      <div className={`modal-content how-to-play-modal ${colorBlindMode ? 'color-blind' : ''}`}>
        <button 
          className="boton-cerrar-fijo" 
          onClick={() => {
            playSound('click.mp3'); // Sonido al cerrar con la X
            onClose();
          }}
        >
          &times;
        </button>
        
        <h2 className="modal-title">{t.messages.howToPlay}</h2>
        
        <div className="board-container">
          <div className="triangle-frame">
            <div className="balls-row">
              <div className="ball p2-color"></div> {/* Usamos clases genéricas */}
            </div>
            <div className="balls-row">
              <div className="ball p1-color"></div>
              <div className="ball p2-color"></div>
            </div>
            <div className="balls-row">
              <div className="ball p2-color"></div>
              <div className="ball p1-color"></div>
              <div className="ball p2-color"></div>
            </div>
          </div>
        </div>

        <div className="instructions-list">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon"><MousePointer2 size={20} /></div>
            <div className="step-text">
              <h3>{(t as any).instructions.step1Title}</h3>
              <p>{(t as any).instructions.step1Text}</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon"><Target size={20} /></div>
            <div className="step-text">
              <h3>{(t as any).instructions.step2Title}</h3>
              <p>{(t as any).instructions.step2Text}</p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon"><Trophy size={20} /></div>
            <div className="step-text">
              <h3>{(t as any).instructions.step3Title}</h3>
              <p>{(t as any).instructions.step3Text}</p>
            </div>
          </div>
        </div>

        <div className="video-resource">
          <p className="confirm-text" style={{ fontSize: '0.9rem', marginBottom: '0.625rem', color: '#fafafa' }}>
            {t.messages.wantToSeeAction}
          </p>
          <a 
            href="https://youtu.be/eDGei98yBtY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link-btn"
            onClick={() => playSound('click.mp3')} // Sonido al hacer clic en el enlace de video
          >
            <Youtube size={20} color="#ff0000" />
            <span>{t.buttons.watchVideo}</span>
          </a>
        </div>

        <button 
          className="understood-btn btn-blue" 
          onClick={() => {
            playSound('click.mp3'); // Sonido al confirmar lectura
            onClose();
          }} 
          style={{ marginTop: '20px' }}
        >
          {t.buttons.understood}
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;