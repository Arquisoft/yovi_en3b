import React, { useEffect, useState } from "react";
import { Edit2, Check, Lock } from "lucide-react"; // Added Lock icon
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import "./ProfileOverlay.css";

interface ProfileOverlayProps { open: boolean; onClose: () => void; }

const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // States for password change logic
  const [showPassFields, setShowPassFields] = useState(false);
  const [passData, setPassData] = useState({ current: '', next: '', confirm: '' });

  const { profile, ranking, loading, error, draftName, setDraftName, draftAvatarId, setDraftAvatarId, dirty, save, resetDraft } = useUserProfile(open);

  const isNameEmpty = draftName.trim() === "";

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowPassFields(false); // Reset password view when closing
    }
  }, [open]);

  const handlePasswordChange = () => {
    // Here you would call your API to update the password
    console.log("Changing password to:", passData.next);
    setShowPassFields(false);
    setPassData({ current: '', next: '', confirm: '' });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">
        <button className="boton-cerrar-fijo" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">USER PROFILE</h2>

        {loading ? <div className="loading-text">LOADING...</div> : error ? <div className="error">{error}</div> : profile && (
          <>
            <div className="avatar-display-section">
              <div className="avatar-bubble">{draftAvatarId ? AVATARS[parseInt(draftAvatarId.slice(-2))-1] : "👤"}</div>
            </div>

            <div className="profile-fields">
              {/* DISPLAY NAME FIELD */}
              <div className="profile-row">
                <label>DISPLAY NAME</label>
                <div className="input-row">
                  <input 
                    value={draftName} 
                    onChange={(e) => setDraftName(e.target.value)} 
                    maxLength={20} 
                    disabled={!isEditing}
                    className="orbitron-text"
                  />
                  <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Check size={18} color="#60a5fa" /> : <Edit2 size={18} color="white" />}
                  </button>
                </div>
                {isNameEmpty && <p className="error-text">Username must be completed!</p>}
              </div>

              {/* READ-ONLY USERNAME */}
              <div className="profile-row readonly">
                <label>USERNAME</label>
                <span className="value orbitron-text">{profile.username}</span>
                <span className="input-hint" style={{fontSize: '0.6rem'}}>UNIQUE ID - CANNOT BE CHANGED</span>
              </div>

              {/* PASSWORD CHANGE SECTION */}
              <div className="profile-row">
                <label>SECURITY</label>
                {!showPassFields ? (
                  <button className="change-pass-trigger orbitron-text" onClick={() => setShowPassFields(true)}>
                    <Lock size={14} /> CHANGE PASSWORD
                  </button>
                ) : (
                  <div className="password-edit-box">
                    <input 
                      type="password" 
                      placeholder="CURRENT PASSWORD" 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, current: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder="NEW PASSWORD" 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, next: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder="CONFIRM NEW" 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                    />
                    <div className="pass-actions">
                      <button className="cancel-pass" onClick={() => setShowPassFields(false)}>CANCEL</button>
                      <button 
                        className="confirm-pass" 
                        disabled={!passData.next || passData.next !== passData.confirm}
                        onClick={handlePasswordChange}
                      >CONFIRM</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-row readonly">
                <label>RANKING</label>
                <span className="value orbitron-text">{ranking ? `${ranking.position} / ${ranking.totalPlayers}` : "—"}</span>
              </div>

              <div className="profile-row">
                <label>CHOOSE AVATAR</label>
                <div className="avatar-grid">
                  {AVATARS.map((emoji, i) => {
                    const id = `avatar_0${i + 1}`;
                    return (
                      <button key={id} className={`avatar-opt ${draftAvatarId === id ? 'active' : ''}`} onClick={() => setDraftAvatarId(id)}>
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="profile-actions-section">
              <button className="main-button btn-blue history-btn orbitron-text" onClick={() => navigate("/history")}>
                ACCESS GAME HISTORY
              </button>

              <div className="btn-group">
                <button className="main-button orbitron-text" onClick={resetDraft} disabled={!dirty}>RESET</button>
                <button className="main-button btn-blue orbitron-text" onClick={save} disabled={!dirty || isNameEmpty}>SAVE</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};