// UBICACIÓN: webapp/src/components/Register/RegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useSettings } from '../../context/SettingsContext'; // Import settings to use playSound
import './RegisterForm.css'; 

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  const { playSound } = useSettings(); // Access the sound player function

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevents page refresh on form submission
    playSound('click.mp3'); // Play click sound when submitting the form
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.'); 
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
        // 1. We get the header
        const authHeader = res.headers.get('Authorization');
        
        // 2. We verify that the token arises an we isolate it (Bearer + XXXXXX)
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1]; 
          // Save auth token to local storage
          localStorage.setItem('token', token);
        }
        localStorage.setItem('username', username); // Save username for global reference
        localStorage.setItem('userId', data.id || ''); // Save user ID for match creation
        console.log('Login stored userId:', localStorage.getItem('userId'));
        navigate('/menu'); // Redirect user to the main menu
      } else {
        setError(data.message || 'Error in the login. Please check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Please try again later.');
      console.error("Connection error:", err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-container"> 
      <div className="login-card">
        <h1 className="title-game cubic-text" style={{ fontSize: '3rem' }}>GAME Y</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="orbitron-text" htmlFor="login-username">USERNAME</label>
            <input
              id="login-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              className="orbitron-text"
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label className="orbitron-text" htmlFor="login-password">PASSWORD</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="orbitron-text"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text orbitron-text">{error}</p>}

          <button type="submit" className="main-button btn-blue play-btn" disabled={loading}>
            {loading ? 'LOADING...' : 'PLAY'} 
          </button>
    
          <div className="auth-footer">
            <span className="orbitron-text" style={{ color: '#64748b' }}>DON'T HAVE AN ACCOUNT? </span>
            <button 
              type="button" 
              className="auth-link" 
              onClick={() => {
                playSound('click.mp3'); // Play click sound when navigating to signup
                navigate('/signup');
              }}
            > 
              SIGN UP
            </button>
          </div>
        
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;