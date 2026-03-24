import React, { useEffect, useState, useRef } from "react";
import { Edit2, Check, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Navigation hook
import { useUserProfile } from "./useUserProfile";
import { useI18n } from "../../i18n/useTranslation";
import { useSettings } from "../../context/SettingsContext"; // Settings context
import "./ProfileOverlay.css";

interface ProfileOverlayProps { open: boolean; onClose: () => void; }

const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const { colorBlindMode, neonMode } = useSettings(); // Added neonMode for consistency
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [showPassFields, setShowPassFields] = useState(false);
  const [passData, setPassData] = useState({ current: '', next: '', confirm: '' });

  const { profile, ranking, loading, error, draftName, setDraftName, draftAvatarId, setDraftAvatarId, dirty, save, resetDraft } = useUserProfile(open);

  const isNameEmpty = draftName.trim() === "";
  const accentColor = colorBlindMode ? "#f59e0b" : "#60a5fa"; // Dynamic color for inline icons

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowPassFields(false);
    }
  }, [open]);

  const handleConfirmName = () => {
    if (!isNameEmpty) setIsEditing(false);
  };

  const handlePasswordChange = () => {
    setShowPassFields(false);
    setPassData({ current: '', next: '', confirm: '' });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={isEditing ? undefined : onClose}>
      {/* Added neon-mode class to the modal content */}
      <div className={`modal-content profile-modal ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`} onClick={(e) => e.stopPropagation()}>

        <button
          className="boton-cerrar-fijo"
          onClick={isEditing ? undefined : onClose}
          disabled={isEditing}
          style={{ opacity: isEditing ? 0.5 : 1 }}
        >
          <X size={35} /> {/* Close icon */}
        </button>

        <h2 className="modal-title">{t.labels.userProfile}</h2>

        {loading ? (
          <div className="loading-text">{t.messages.loading}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : profile && (
          <>
            <div className="avatar-display-section">
              <div className="avatar-bubble">
                {draftAvatarId ? AVATARS[parseInt(draftAvatarId.slice(-2)) - 1] : "👤"}
              </div>
            </div>

            <div className="profile-fields">
              <div className="profile-row">
                <label>{t.labels.displayName}</label>
                <div className="input-row">
                  <input
                    ref={inputRef}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    maxLength={20}
                    disabled={!isEditing}
                    className="orbitron-text"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmName();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                  />
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <Edit2 size={18} color="white" />
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={handleConfirmName}
                      disabled={isNameEmpty}
                      title={isNameEmpty ? t.messages.usernameMustBeCompleted : t.buttons.confirm}
                    >
                      <Check size={18} color={isNameEmpty ? "gray" : accentColor} />
                    </button>
                  )}
                </div>
                {isNameEmpty && <p className="error-text">{t.messages.usernameMustBeCompleted}</p>}
              </div>

              <div className="profile-row readonly">
                <label>{t.labels.username}</label>
                <span className="value orbitron-text">{profile.username}</span>
              </div>

              <div className="profile-row">
                <label>{t.labels.security}</label>
                {!showPassFields ? (
                  <button className="change-pass-trigger orbitron-text" onClick={() => setShowPassFields(true)}>
                    <Lock size={14} /> {t.buttons.changePassword}
                  </button>
                ) : (
                  <div className="password-edit-box">
                    <input 
                      type="password" 
                      placeholder={t.labels.currentPassword} 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, current: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder={t.labels.newPassword} 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, next: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder={t.labels.confirmNew} 
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                    />
                    <div className="pass-actions">
                      <button className="cancel-pass" onClick={() => setShowPassFields(false)}>{t.buttons.cancel}</button>
                      <button 
                        className="confirm-pass" 
                        disabled={!passData.next || passData.next !== passData.confirm}
                        onClick={handlePasswordChange}
                      >{t.buttons.confirm}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-row readonly">
                <label>{t.labels.ranking}</label>
                <span className="value orbitron-text">
                  {ranking ? `${ranking.position} / ${ranking.totalPlayers}` : "—"}
                </span>
              </div>

              <div className="profile-row">
                <label>{t.labels.chooseAvatar}</label>
                <div className="avatar-grid">
                  {AVATARS.map((emoji, i) => {
                    const id = `avatar_0${i + 1}`;
                    return (
                      <button
                        key={id}
                        className={`avatar-opt ${draftAvatarId === id ? "active" : ""}`}
                        onClick={() => setDraftAvatarId(id)}
                        disabled={isEditing}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="profile-actions-section" style={{ position: "relative" }}>
              {isEditing && (
                <div className="editing-lock-overlay" title={t.messages.confirmTheDisplayNameFirst} />
              )}
              {/* This button now redirects correctly to /history */}
              <button
                className={`main-button ${colorBlindMode ? 'btn-orange' : 'btn-blue'} history-btn orbitron-text`}
                onClick={() => {
                  onClose(); // Close the overlay first
                  navigate("/history"); // Then navigate to history
                }}
                disabled={isEditing}
              >
                {t.buttons.accessGameHistory}
              </button>

              <div className="btn-group">
                <button className="main-button orbitron-text" onClick={resetDraft} disabled={!dirty}>{t.buttons.reset}</button>
                <button className={`main-button ${colorBlindMode ? 'btn-orange' : 'btn-blue'} orbitron-text`} onClick={save} disabled={!dirty || isNameEmpty}>{t.buttons.save}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};