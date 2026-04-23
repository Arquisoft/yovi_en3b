// UBICACIÓN: webapp/src/components/LanguageDialog/LanguageDialog.tsx
import React from 'react';
import { useI18n } from '../../i18n/useTranslation';
import { useSettings } from '../../context/SettingsContext'; // Importamos los ajustes
import './LanguageDialog.css';

interface LanguageDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ open, onClose }) => {
  const { t, language, setLanguage } = useI18n();
  const { colorBlindMode, playSound } = useSettings(); // Accedemos al estado daltónico y a playSound

  if (!open) return null;

  const handleLanguageChange = (lang: 'es' | 'en' | 'tr') => {
    playSound('click.mp3'); // Sonido al elegir un idioma
    setLanguage(lang);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playSound('click.mp3');
      onClose();
    }
  };

  return (
    <div className="language-overlay" onClick={() => { playSound('click.mp3'); onClose(); }} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
      <div 
        className={`language-modal ${colorBlindMode ? 'color-blind' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button 
          className="close-x-lang" 
          onClick={() => {
            playSound('click.mp3'); // Sonido al cerrar con la X
            onClose();
          }}
        >
          &times;
        </button>
        <h2 className="language-title">{t.messages.selectLanguage}</h2>
        <div className="language-options">
          <button
            className={`btn-lang-white ${language === 'es' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('es')}
          >
            {t.buttons.spanish}
          </button>
          <button
            className={`btn-lang-white ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            {t.buttons.english}
          </button>
          <button
            className={`btn-lang-white ${language === 'tr' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('tr')}
          >
            {t.buttons.turkish}
          </button>
        </div>
      </div>
    </div>
  );
};