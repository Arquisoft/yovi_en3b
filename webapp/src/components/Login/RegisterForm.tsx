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
    event.preventDefault(); // Prevents page refresh on submit.
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.'); // Basic validation before sending data.
      return;
    }

    setLoading(true); // Starts the loading state.
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'; // Backend endpoint.
      const res = await fetch(`${API_URL}/users/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) // Sending credentials to server.
      });

      // --- CAMBIO AQUÍ: Entramos siempre ---
      if (res.ok) {
        navigate('/menu'); // Success case: Navigate to menu.
      } else {
        // Si el servidor da error (ej. 400), forzamos la entrada igualmente
        console.warn("Server returned an error, but bypassing for design testing."); // Debug warning.
        navigate('/menu'); // Bypassing server error.
      }
    } catch (err) {
      // Si no hay conexión (Docker apagado), también entramos
      console.error("Connection failed, forcing entry."); // Debug error.
      navigate('/menu'); // Bypassing connection error.
    } finally {
      setLoading(false); // Ends the loading state.
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
              onChange={(e) => setUsername(e.target.value)} // Updates username state.
              className="orbitron-text"
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label className="orbitron-text">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Updates password state.
              className="orbitron-text"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text orbitron-text">{error}</p>}

          <button type="submit" className="main-button btn-blue play-btn" disabled={loading}>
            {loading ? 'LOADING...' : 'PLAY'} {/* Button label changes during request. */}
          </button>
    

          {/* New Sign Up link styled as a gray text link */}
          <div className="auth-footer">
            <span className="orbitron-text" style={{ color: '#64748b' }}>DON'T HAVE AN ACCOUNT? </span>
               <button 
                   type="button" 
                   className="auth-link" 
                   onClick={() => navigate('/signup')} // Here we change the screen to signup
              > SIGN UP
               </button>
          </div>
        
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;