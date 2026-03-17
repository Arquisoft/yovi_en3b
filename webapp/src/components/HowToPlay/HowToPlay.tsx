// UBICACIÓN: webapp/src/components/HowToPlay/HowToPlay.tsx
import React from 'react';
import { MousePointer2, Target, Trophy, Youtube } from 'lucide-react';
import { useI18n } from '../../i18n/useTranslation'; // Importamos el hook
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const { t } = useI18n(); // Accedemos a las traducciones

  return (
    <div className="modal-overlay">
      <div className="modal-content how-to-play-modal">
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">{t.messages.howToPlay}</h2>
        
        <div className="board-container">
          <div className="triangle-frame">
            <div className="balls-row">
              <div className="ball red"></div>
            </div>
            <div className="balls-row">
              <div className="ball blue"></div>
              <div className="ball red"></div>
            </div>
            <div className="balls-row">
              <div className="ball red"></div>
              <div className="ball blue"></div>
              <div className="ball red"></div>
            </div>
          </div>
        </div>

        <div className="instructions-list">
          {/* Paso 1 */}
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon"><MousePointer2 size={20} /></div>
            <div className="step-text">
              <h3>{(t as any).instructions.step1Title}</h3>
              <p>{(t as any).instructions.step1Text}</p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon"><Target size={20} /></div>
            <div className="step-text">
              <h3>{(t as any).instructions.step2Title}</h3>
              <p>{(t as any).instructions.step2Text}</p>
            </div>
          </div>

          {/* Paso 3 */}
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
          <p className="confirm-text" style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#fafafa' }}>
            {t.messages.wantToSeeAction}
          </p>
          <a 
            href="https://youtu.be/eDGei98yBtY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link-btn"
          >
            <Youtube size={20} color="#ff0000" />
            <span>{t.buttons.watchVideo}</span>
          </a>
        </div>

        <button className="understood-btn btn-blue" onClick={onClose} style={{ marginTop: '20px' }}>
          {t.buttons.understood}
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;