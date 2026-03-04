import React, { useEffect, useState } from "react";
import { X, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import "./ProfileOverlay.css";

interface ProfileOverlayProps { open: boolean; onClose: () => void; }

const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { profile, ranking, loading, error, draftName, setDraftName, draftAvatarId, setDraftAvatarId, dirty, save, resetDraft } = useUserProfile(open);

  // Validación: El nombre está vacío si tras borrar espacios no queda nada
  const isNameEmpty = draftName.trim() === "";

  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}><X size={35} /></button>
        
        <h2 className="modal-title">USER PROFILE</h2>

        {loading ? <div className="loading-text">LOADING...</div> : error ? <div className="error">{error}</div> : profile && (
          <>
            <div className="avatar-display-section">
              <div className="avatar-bubble">{draftAvatarId ? AVATARS[parseInt(draftAvatarId.slice(-2))-1] : "👤"}</div>
            </div>

            <div className="profile-fields">
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
                {/* Mensaje de error condicional */}
                {isNameEmpty && <p className="error-text">Username must be completed!</p>}
              </div>

              <div className="profile-row readonly">
                <label>USERNAME</label>
                <span className="value orbitron-text">{profile.username}</span>
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
                {/* SAVE deshabilitado si no hay cambios (dirty) o si el nombre está vacío */}
                <button className="main-button btn-blue orbitron-text" onClick={save} disabled={!dirty || isNameEmpty}>SAVE</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};