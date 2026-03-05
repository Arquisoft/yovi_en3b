import React from 'react';
import { useI18n } from '../../i18n/useTranslation';
import '../../App.css';

interface LanguageDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ open, onClose }) => {
  const { t, language, setLanguage } = useI18n();

  if (!open) return null;

  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{t.messages.selectLanguage}</h2>
        <div className="modal-grid">
          <button
            className={`opt-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('es')}
          >
            🇪🇸 {t.buttons.spanish}
          </button>
          <button
            className={`opt-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            🇬🇧 {t.buttons.english}
          </button>
        </div>
      </div>
    </div>
  );
};
