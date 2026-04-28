// UBICACIÓN: webapp/src/components/Register/RegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useSettings } from '../../context/SettingsContext'; 
import { useI18n } from "../../i18n/useTranslation";
import { Globe } from 'lucide-react'; // Icono opcional para el selector
import './RegisterForm.css'; 

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  
  // Extraemos t (traducciones), language (actual) y setLanguage (función para cambiar)
  const i18n = useI18n();
  const { playSound, startBackgroundMusic } = useSettings();

  // Verificación de seguridad por si el contexto aún no carga
  if (!i18n) return null;
  const { t, language, setLanguage } = i18n;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    playSound('click.mp3'); 
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(t.messages.fillAllFields); // Texto traducido
      return;
    }

    setLoading(true); 
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'; 
      const res = await fetch(`${API_URL}/users/loginUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) 
      });

      const data = await res.json();

      if (res.ok) {
        const authHeader = res.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1]; 
          localStorage.setItem('token', token);
        }
        startBackgroundMusic(); 
        localStorage.setItem('username', username); // Save username for global reference
        localStorage.setItem('userId', data.id || ''); // Save user ID for match creation
        console.log('Login stored userId:', localStorage.getItem('userId'));
        navigate('/menu'); // Redirect user to the main menu
      } else {
        setError(data.message || t.messages.loginError); // Texto traducido
      }
    } catch (err) {
      setError(t.messages.cannotConnectServer); // Texto traducido
      console.error("Connection error:", err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-container"> 
      <div className="login-card">
        
        {/* --- NUEVO: SELECTOR DE IDIOMA --- */}
        <div className="language-selector-container">
          <Globe size={18} className="globe-icon" />
          <button 
            type="button"
            className={`lang-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
          >ES</button>
          <button 
            type="button"
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >EN</button>
          <button 
            type="button"
            className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
            onClick={() => setLanguage('tr')}
          >TR</button>
        </div>

        <h1 className="title-game cubic-text" style={{ fontSize: '9rem' }}>GAME Y</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="orbitron-text" htmlFor="login-username">
              {t.labels.username}
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              className="orbitron-text"
              placeholder={t.placeholders?.enterUsername || "User..."}
            />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="login-password">
              {t.labels.password}
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="orbitron-text"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text orbitron-text">{error}</p>}

          <button type="submit" className="main-button btn-blue play-btn" disabled={loading}>
            {loading ? t.buttons.loading : t.buttons.play} 
          </button>
    
          <div className="auth-footer">
            <span className="orbitron-text" style={{ color: '#64748b' }}>
              {t.labels.dontHaveAccount} 
            </span>
            <button 
              type="button" 
              className="auth-link" 
              onClick={() => {
                playSound('click.mp3'); 
                navigate('/signup');
              }}
            > 
              {t.buttons.signupLink || t.labels.signup}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;