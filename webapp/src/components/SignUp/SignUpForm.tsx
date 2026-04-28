// UBICACIÓN: webapp/src/components/SignUp/SignUpForm.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Globe } from 'lucide-react'; 
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from "../../i18n/useTranslation";
import './SignUpForm.css';

const SignUpForm: React.FC = () => {
  const { playSound, startBackgroundMusic } = useSettings(); // Funciones de sonido
  const { t, language, setLanguage } = useI18n(); // Hook de traducción
  const navigate = useNavigate();

  const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];
  
  const [formData, setFormData] = useState({
    nickname: '',
    username: '',
    email: '',
    password: '',
    avatarId: "avatar_01"
  });
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VALIDACIÓN DINÁMICA: Se recalcula cada vez que cambia el password
  const passwordValidations = useMemo(() => ({
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }), [formData.password]);

  const allValidationsPass = Object.values(passwordValidations).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value })); // Actualiza el estado de los inputs
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allValidationsPass) return;

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const response = await fetch(`${API_URL}/users/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          photo: formData.avatarId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('username', formData.username);
        localStorage.setItem('userId', data.id || '');
        
        // SONIDO Y MÚSICA: Al ser éxito, disparamos el feedback y la música de fondo
        playSound('click.mp3'); // Sonido de clic/éxito
        startBackgroundMusic(); // Desbloquea e inicia la música del juego

        setTimeout(() => {
          navigate('/menu'); // Redirige al menú principal
        }, 150); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || t.messages.errorCreatingAccount); // Error de la API traducido
      }
    } catch (err) {
      setError(t.messages.cannotConnectServer); // Error de conexión traducido
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* BOTONES DE CABECERA: Cerrar e Idioma */}
        <div className="signup-header-actions">
          <div className="language-selector-mini">
            <Globe size={16} color="white" className="globe-icon" />
            <button 
              className={`lang-btn ${language === 'es' ? 'active' : ''}`} 
              onClick={() => { playSound('click.mp3'); setLanguage('es'); }}
            >
              ES
            </button>
            <button 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
              onClick={() => { playSound('click.mp3'); setLanguage('en'); }}
            >
              EN
            </button>
            <button 
              className={`lang-btn ${language === 'tr' ? 'active' : ''}`} 
              onClick={() => { playSound('click.mp3'); setLanguage('tr'); }}
            >
              TR
            </button>
          </div>

          <button 
            className="boton-cerrar-fijo" 
            onClick={() => {
              playSound('click.mp3'); // Sonido al cerrar
              navigate('/');
            }}
          >
            &times;
          </button>
        </div>
        
        <h1 className="title-game cubic-text" style={{ fontSize: '2.2rem', marginTop: '10px' }}>
          {t.labels.signup} 
        </h1>
        
        <form onSubmit={handleSave} className="signup-form">
          <div className="avatar-display-section">
            <div className="avatar-bubble">
              {AVATARS[parseInt(formData.avatarId.slice(-2)) - 1]} 
            </div>
          </div>

          <div className="avatar-grid">
            {AVATARS.map((emoji, i) => {
              const id = `avatar_0${i + 1}`;
              return (
                <button 
                  key={id} 
                  type="button" 
                  className={`avatar-opt ${formData.avatarId === id ? 'active' : ''}`} 
                  onClick={() => {
                    playSound('click.mp3'); // Sonido al elegir avatar
                    setFormData(prev => ({...prev, avatarId: id}));
                  }}
                >
                  {emoji} 
                </button>
              );
            })}
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-nickname">{t.labels.nickname}</label>
            <input id="signup-nickname" name="nickname" type="text" className="orbitron-text" value={formData.nickname} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-username">{t.labels.username}</label>
            <input id="signup-username" name="username" type="text" className="orbitron-text" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-email">{t.labels.email}</label>
            <input id="signup-email" name="email" type="email" className="orbitron-text" value={formData.email} onChange={handleChange} required />
          </div>

          {/* SOLUCIÓN ALINEACIÓN: Agrupamos todo el bloque de contraseña */}
          <div className="input-group">
            <label htmlFor="password" className="orbitron-text">{t.labels.password}</label>
            
            {/* El wrapper y el botón DEBEN estar dentro del input-group */}
            <div className="password-wrapper">
              <input 
                id="password"
                name="password" 
                type={showPass ? "text" : "password"} 
                className="orbitron-text" 
                value={formData.password}
                onChange={handleChange} 
                required 
                autoComplete="new-password" 
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => {
                  playSound('click.mp3'); // Sonido al alternar ojo
                  setShowPass(!showPass);
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="validation-grid">
              <div className={`val-item ${passwordValidations.length ? 'valid' : ''}`}>
                {passwordValidations.length ? <Check size={12}/> : <X size={12}/>} {t.validation.chars8}
              </div>
              <div className={`val-item ${passwordValidations.hasUpper ? 'valid' : ''}`}>
                {passwordValidations.hasUpper ? <Check size={12}/> : <X size={12}/>} {t.validation.uppercase}
              </div>
              <div className={`val-item ${passwordValidations.hasNumber ? 'valid' : ''}`}>
                {passwordValidations.hasNumber ? <Check size={12}/> : <X size={12}/>} {t.validation.number}
              </div>
              <div className={`val-item ${passwordValidations.hasSpecial ? 'valid' : ''}`}>
                {passwordValidations.hasSpecial ? <Check size={12}/> : <X size={12}/>} {t.validation.special}
              </div>
            </div>
          </div>

          {error && <p className="live-error-text">{error}</p>}

          <button 
            type="submit" 
            className="main-button btn-blue save-btn-compact"
            disabled={loading || !allValidationsPass || !formData.email || !formData.nickname || !formData.username}
          >
            {loading ? t.buttons.creating : t.buttons.saveAccount}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;