// UBICACIÓN: webapp/src/components/Profile/ProfileOverlay.tsx
import React, { useEffect, useState, useRef } from "react";
import { Edit2, Check, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { useUserProfile } from "./useUserProfile";
import { useI18n } from "../../i18n/useTranslation";
import { useSettings } from "../../context/SettingsContext"; 
import "./ProfileOverlay.css";
import { changePassword } from "./userProfile.api";
import { toast } from "sonner";
import { AVATAR_OPTIONS, getAvatarGlyph } from "../avatarCatalog";

interface ProfileOverlayProps { open: boolean; onClose: () => void; }

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const { colorBlindMode, neonMode, playSound } = useSettings(); // Added playSound for UI feedback
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [showPassFields, setShowPassFields] = useState(false);
  const [passData, setPassData] = useState({ current: '', next: '', confirm: '' });

  const { profile, ranking, loading, error, draftName, setDraftName, draftAvatarId, setDraftAvatarId, dirty, save, resetDraft } = useUserProfile(open);

  const isNameEmpty = draftName.trim() === "";

  const passValidations = {
    length: passData.next.length >= 8,
    hasUpper: /[A-Z]/.test(passData.next),
    hasNumber: /[0-9]/.test(passData.next),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(passData.next)
  };

  const canConfirmPassword =
    passData.current &&
    passData.next &&
    passData.confirm === passData.next &&
    Object.values(passValidations).every(Boolean);

  const accentColor = colorBlindMode ? "#f59e0b" : "#60a5fa"; 

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowPassFields(false);
    }
  }, [open]);

  const handleConfirmName = () => {
    playSound('click.mp3'); // Play sound when confirming name edit
    if (!isNameEmpty) setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    playSound('click.mp3'); // Play sound when clicking the main change button
    if (passData.next !== passData.confirm) {
       toast.error(t.messages.passwordsDoNotMatch);
      return;
    }

    try {
      await changePassword(passData.current, passData.next);
      toast.success(t.messages.passwordChangedSuccess);
      setShowPassFields(false);
      setPassData({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(t.messages.errorChangingPassword);
    }
  };

  if (!open) return null;

  return (
    <div className="profile-overlay-backdrop" onClick={isEditing ? undefined : () => { playSound('click.mp3'); onClose(); }}>
      {/* Added neon-mode class to the modal content */}
      <div className={`profile-overlay-card profile-modal modal-content ${colorBlindMode ? 'color-blind' : ''} ${neonMode ? 'neon-mode' : ''}`} onClick={(e) => e.stopPropagation()}>

        <button
          className="profile-close-btn"
          onClick={() => {
            if (!isEditing) {
              playSound('click.mp3'); // Play sound when closing modal
              onClose();
            }
          }}
          disabled={isEditing}
          style={{ opacity: isEditing ? 0.5 : 1 }}
        >
          <X size={35} /> 
        </button>

        <h2 className="profile-modal-title">{t.labels.userProfile}</h2>

        {loading ? (
          <div className="profile-loading-text">{t.messages.loading}</div>
        ) : error ? (
          <div className="profile-error">{error}</div>
        ) : profile && (
          <>
            <div className="profile-avatar-display">
              <div className="profile-avatar-bubble">
                {getAvatarGlyph(draftAvatarId)}
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
                      if (e.key === "Escape") {
                        playSound('click.mp3'); // Sound on cancel via ESC
                        setIsEditing(false);
                      }
                    }}
                  />
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => { playSound('click.mp3'); setIsEditing(true); }}>
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
                {isNameEmpty && <p className="profile-inline-error">{t.messages.usernameMustBeCompleted}</p>}
              </div>

              <div className="profile-row readonly">
                <label>{t.labels.username}</label>
                <span className="value orbitron-text">{profile.username}</span>
              </div>

              <div className="profile-row">
                <label>{t.labels.security}</label>
                {!showPassFields ? (
                  <button className="change-pass-trigger orbitron-text" onClick={() => { playSound('click.mp3'); setShowPassFields(true); }}>
                    <Lock size={14} /> {t.buttons.changePassword}
                  </button>
                ) : (
                  <div className="password-edit-box">
                    <input
                      type="password"
                      placeholder={t.labels.currentPassword}
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder={t.labels.newPassword}
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({ ...passData, next: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder={t.labels.confirmNew}
                      className="orbitron-text small-input"
                      onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                    />
                    <div className="validation-grid" style={{ marginTop: '10px' }}>
                      <div className={`val-item ${passValidations.length ? 'valid' : ''}`}>
                        {passValidations.length ? <Check size={12} /> : <X size={12} />} {t.validation.chars8}
                      </div>
                      <div className={`val-item ${passValidations.hasUpper ? 'valid' : ''}`}>
                        {passValidations.hasUpper ? <Check size={12} /> : <X size={12} />} {t.validation.uppercase}
                      </div>
                      <div className={`val-item ${passValidations.hasNumber ? 'valid' : ''}`}>
                        {passValidations.hasNumber ? <Check size={12} /> : <X size={12} />} {t.validation.number}
                      </div>
                      <div className={`val-item ${passValidations.hasSpecial ? 'valid' : ''}`}>
                        {passValidations.hasSpecial ? <Check size={12} /> : <X size={12} />} {t.validation.special}
                      </div>
                    </div>
                    <div className="pass-actions">
                      <button className="cancel-pass" onClick={() => { playSound('click.mp3'); setShowPassFields(false); }}>{t.buttons.cancel}</button>
                      <button
                        className="confirm-pass"
                        disabled={!canConfirmPassword}
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
                <div className="profile-avatar-grid">
                  {AVATAR_OPTIONS.map((emoji, i) => {
                    const id = `avatar_0${i + 1}`;
                    return (
                      <button
                        key={id}
                        className={`profile-avatar-opt avatar-opt ${draftAvatarId === id ? "active" : ""}`}
                        onClick={() => {
                          playSound('click.mp3'); // Sound feedback for avatar selection
                          setDraftAvatarId(id);
                        }}
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
              <button
                className="profile-action-btn profile-action-btn--primary profile-history-btn orbitron-text"
                onClick={() => {
                  playSound('click.mp3'); // Feedback when going to history
                  onClose(); 
                  navigate("/history"); 
                }}
                disabled={isEditing}
              >
                {t.buttons.accessGameHistory}
              </button>

              <div className="btn-group profile-btn-group">
                <button className="main-button orbitron-text" onClick={() => { playSound('click.mp3'); resetDraft(); }} disabled={!dirty}>{t.buttons.reset}</button>
                <button className={`main-button ${colorBlindMode ? 'btn-orange' : 'btn-blue'} orbitron-text`} onClick={() => { playSound('click.mp3'); save(); }} disabled={!dirty || isNameEmpty}>{t.buttons.save}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
