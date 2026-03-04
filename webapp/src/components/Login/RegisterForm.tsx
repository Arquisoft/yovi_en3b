import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for navigation
import './RegisterForm.css'; // New specific CSS file

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize navigator

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // API_URL will fallback to localhost:3000 if env variable is missing
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${API_URL}/users/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) // Sending both fields
      });

      if (res.ok) {
        navigate('/menu'); // Success! Go to main menu
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error.'); // Handling "Failed to fetch"
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Main wrapper for centering */}
      <div className="login-card">
        <h1 className="title-game cubic-text" style={{ fontSize: '3rem' }}>GAME Y</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="orbitron-text">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="orbitron-text"
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label className="orbitron-text">PASSWORD</label>
            <input
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
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;