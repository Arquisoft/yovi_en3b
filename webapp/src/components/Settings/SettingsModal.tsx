// UBICACIÓN: webapp/src/components/SettingsModal/SettingsModal.tsx
import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../i18n/useTranslation';
import '../../App.css';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { t } = useI18n();
  const {
    brightness, setBrightness,
    colorBlindMode, setColorBlindMode,
    neonMode, toggleNeonMode,
    volume, setVolume,
    isMuted, setIsMuted,
    playSound,
    confirmMove, setConfirmMove,
    // AHORA TS RECONOCE ESTOS CAMPOS GRACIAS A LA ACTUALIZACIÓN DEL CONTEXTO
    tutorEnabled, setTutorEnabled 
  } = useSettings();

  const handleAction = (action: () => void) => {
    playSound('click.mp3');
    action();
  };

  return (
    <div className="modal-overlay" onClick={() => { playSound('click.mp3'); onClose(); }}>
      <div
        className={`modal-content ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="boton-cerrar-fijo" onClick={() => { playSound('click.mp3'); onClose(); }}>&times;</button>

        <h2 className="modal-title">{t.buttons.settings}</h2>

        <div className="settings-container">
          {/* CONTROL DE BRILLO */}
          <div className="setting-item">
            <label className="modal-text">{t.labels.brightness}: {brightness}%</label>
            <input
              type="range" min="50" max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))} 
              className="settings-slider"
            />
          </div>

          {/* VOLUME CONTROL */}
          <div className="setting-item">
            <label className="modal-text">
              {t.labels.volume || 'VOLUMEN'}: {isMuted ? 0 : volume}%
            </label>
            <input
              type="range" min="0" max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="settings-slider"
              disabled={isMuted}
            />
          </div>

          {/* MUTE */}
          <div className="setting-item">
            <label className="modal-text">{t.labels.mute || 'SILENCIO'}</label>
            <button
              className={`opt-btn ${isMuted ? 'active' : ''}`}
              onClick={() => handleAction(() => setIsMuted(!isMuted))}
            >
              {isMuted ? t.buttons.on : t.buttons.off}
            </button>
          </div>

          {/* COLOR BLIND */}
          <div className="setting-item">
            <label className="modal-text">{t.labels.colorBlindMode}</label>
            <button
              className={`opt-btn ${colorBlindMode ? 'active' : ''}`}
              onClick={() => handleAction(() => setColorBlindMode(!colorBlindMode))}
            >
              {colorBlindMode ? t.buttons.on : t.buttons.off}
            </button>
          </div>

          {/* NEON */}
          <div className="setting-item">
            <label className="modal-text">{t.labels.neonEffects}</label>
            <button
              className={`opt-btn ${neonMode ? 'active' : ''}`}
              onClick={() => handleAction(toggleNeonMode)}
            >
              {neonMode ? t.buttons.on : t.buttons.off}
            </button>
          </div>

          {/* CONFIRM MOVE */}
          <div className="setting-item">
            <label className="modal-text">
              {t.labels.confirmMove || 'CONFIRMAR MOVIMIENTO'}
            </label>
            <button
              className={`opt-btn ${confirmMove ? 'active' : ''}`}
              onClick={() => handleAction(() => setConfirmMove(!confirmMove))}
            >
              {confirmMove ? t.buttons.on : t.buttons.off}
            </button>
          </div>

          {/* TUTOR BOT ENABLE/DISABLE */}
          <div className="setting-item">
            <label className="modal-text">
              {t.labels.tutorEnabled || 'ASISTENTE TUTOR'}
            </label>
            <button
              className={`opt-btn ${tutorEnabled ? 'active' : ''}`}
              onClick={() => handleAction(() => setTutorEnabled(!tutorEnabled))}
            >
              {tutorEnabled ? t.buttons.on : t.buttons.off}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;