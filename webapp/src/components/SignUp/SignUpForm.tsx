import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import './SignUpForm.css';

const SignUpForm: React.FC = () => {
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
  const navigate = useNavigate();

  const passwordValidations = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const allValidationsPass = Object.values(passwordValidations).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // Updates specific field in state
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
        navigate('/'); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error creating account. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <button className="boton-cerrar-fijo" onClick={() => navigate('/')}>&times;</button>
        
        <h1 className="title-game cubic-text" style={{ fontSize: '2.2rem', marginBottom: '20px' }}>SIGN UP</h1>
        
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
                  onClick={() => setFormData({...formData, avatarId: id})}
                >
                  {emoji} 
                </button>
              );
            })}
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-nickname">NICKNAME</label>
            <input id="signup-nickname" name="nickname" type="text" className="orbitron-text" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-username">USERNAME</label>
            <input id="signup-username" name="username" type="text" className="orbitron-text" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="signup-email">EMAIL</label>
            <input id="signup-email" name="email" type="email" className="orbitron-text" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="orbitron-text">PASSWORD</label>
            <div className="password-wrapper">
              <input 
                id="password"
                name="password" 
                type={showPass ? "text" : "password"} 
                className="orbitron-text" 
                onChange={handleChange} 
                required 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="validation-grid">
              <div className={`val-item ${passwordValidations.length ? 'valid' : ''}`}>{passwordValidations.length ? <Check size={12}/> : <X size={12}/>} 8+ chars</div>
              <div className={`val-item ${passwordValidations.hasUpper ? 'valid' : ''}`}>{passwordValidations.hasUpper ? <Check size={12}/> : <X size={12}/>} Uppercase</div>
              <div className={`val-item ${passwordValidations.hasNumber ? 'valid' : ''}`}>{passwordValidations.hasNumber ? <Check size={12}/> : <X size={12}/>} Number</div>
              <div className={`val-item ${passwordValidations.hasSpecial ? 'valid' : ''}`}>{passwordValidations.hasSpecial ? <Check size={12}/> : <X size={12}/>} Special</div>
            </div>
          </div>

          {error && <p className="live-error-text">{error}</p>}

          <button 
            type="submit" 
            className="main-button btn-blue save-btn-compact"
            disabled={loading || !allValidationsPass || !formData.email || !formData.nickname || !formData.username}
          >
            {loading ? 'CREATING...' : 'SAVE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
