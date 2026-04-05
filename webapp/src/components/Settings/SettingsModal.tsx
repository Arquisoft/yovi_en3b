import React from 'react'; // React core
import { useSettings } from '../../context/SettingsContext'; // Global settings hook
import { useI18n } from '../../i18n/useTranslation'; // Translation hook
import '../../App.css'; // Global styles

interface SettingsModalProps {
  onClose: () => void; // Function to close modal
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { t } = useI18n(); // Access translations
  const { 
    brightness, setBrightness, 
    colorBlindMode, setColorBlindMode,
    neonMode, toggleNeonMode 
  } = useSettings(); // Access all global settings
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">{t.buttons.settings}</h2>

        <div className="settings-container">
          <div className="setting-item">
            <label className="modal-text">{t.labels.brightness}: {brightness}%</label>
            <input 
              type="range" min="50" max="150" 
              value={brightness} 
              onChange={(e) => setBrightness(Number(e.target.value))} 
              className="settings-slider"
            />
          </div>

          <div className="setting-item">
            <label className="modal-text">{t.labels.colorBlindMode}</label>
            <button 
              className={`opt-btn ${colorBlindMode ? 'active' : ''}`}
              onClick={() => setColorBlindMode(!colorBlindMode)}
            >
              {colorBlindMode ? t.buttons.on : t.buttons.off}
            </button>
          </div>

          <div className="setting-item">
            <label className="modal-text">{t.labels.neonEffects}</label>
            <button 
              className={`opt-btn ${neonMode ? 'active' : ''}`} // Dynamic active class
              onClick={toggleNeonMode} // Real toggle function
            >
              {neonMode ? t.buttons.on : t.buttons.off} 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;