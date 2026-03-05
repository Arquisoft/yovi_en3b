import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import './SignUpForm.css';

const SignUpForm: React.FC = () => {
  const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    avatarId: "avatar_01"
  });
  
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const passwordValidations = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const allValidationsPass = Object.values(passwordValidations).every(Boolean);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (allValidationsPass) {
      console.log("Account created:", formData);
      navigate('/menu'); 
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

          <div className="avatar-selection-row">
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
          </div>

          <div className="input-group">
            <label className="orbitron-text">NAME</label>
            <input name="name" type="text" className="orbitron-text" onChange={handleChange} required placeholder="How do you want to be called?" />
          </div>

          <div className="input-group">
            <label className="orbitron-text">USERNAME</label>
            <input name="username" type="text" className="orbitron-text" onChange={handleChange} required placeholder="Cannot be changed later" />
          </div>

          <div className="input-group">
            <label className="orbitron-text">EMAIL</label>
            <input name="email" type="email" className="orbitron-text" onChange={handleChange} required placeholder="email@example.com" />
          </div>

          <div className="input-group">
            <label className="orbitron-text">PASSWORD</label>
            <div className="password-wrapper">
              <input 
                name="password" 
                type={showPass ? "text" : "password"} 
                className="orbitron-text" 
                onChange={handleChange} 
                required 
                placeholder="••••••••" 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="validation-grid">
              <div className={`val-item ${passwordValidations.length ? 'valid' : ''}`}>
                {passwordValidations.length ? <Check size={12} /> : <X size={12} />} 8+ Characters
              </div>
              <div className={`val-item ${passwordValidations.hasUpper ? 'valid' : ''}`}>
                {passwordValidations.hasUpper ? <Check size={12} /> : <X size={12} />} 1 Uppercase
              </div>
              <div className={`val-item ${passwordValidations.hasNumber ? 'valid' : ''}`}>
                {passwordValidations.hasNumber ? <Check size={12} /> : <X size={12} />} 1 Number
              </div>
              <div className={`val-item ${passwordValidations.hasSpecial ? 'valid' : ''}`}>
                {passwordValidations.hasSpecial ? <Check size={12} /> : <X size={12} />} 1 Special (!@#)
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="main-button btn-blue save-btn-compact"
            disabled={!allValidationsPass || !formData.email || !formData.name || !formData.username}
          >
            SAVE ACCOUNT
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;