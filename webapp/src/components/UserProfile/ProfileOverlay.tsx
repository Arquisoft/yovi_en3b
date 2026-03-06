import React, { useEffect, useRef, useState } from "react";
import { X, Edit2, Check, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import { useI18n } from "../../i18n/useTranslation";
import "./ProfileOverlay.css";

interface ProfileOverlayProps {
  open: boolean;
  onClose: () => void;
}

const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Password change states (new feature from colleague)
  const [showPassFields, setShowPassFields] = useState(false);
  const [passData, setPassData] = useState({ current: "", next: "", confirm: "" });

  const {
    profile,
    ranking,
    loading,
    error,
    draftName,
    setDraftName,
    draftAvatarId,
    setDraftAvatarId,
    dirty,
    save,
    resetDraft,
  } = useUserProfile(open);

  const isNameEmpty = draftName.trim() === "";

  // Determine if any editing is in progress
  const isAnyEditing = isEditing || showPassFields;

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowPassFields(false);
      setPassData({ current: "", next: "", confirm: "" });
    }
  }, [open]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleConfirmName = () => {
    if (isNameEmpty) return;
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // TODO: Call API to update password
    console.log("Changing password to:", passData.next);
    setShowPassFields(false);
    setPassData({ current: "", next: "", confirm: "" });
  };

  const isPasswordValid =
    passData.current.length > 0 &&
    passData.next.length > 0 &&
    passData.next === passData.confirm;

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={isAnyEditing ? undefined : onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="close-modal"
          onClick={isAnyEditing ? undefined : onClose}
          disabled={isAnyEditing}
        >
          <X size={35} />
        </button>

        <h2 className="modal-title">{t.labels.userProfile}</h2>

        {loading ? (
          <div className="loading-text">{t.messages.loading}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          profile && (
            <>
              <div className="avatar-display-section">
                <div className="avatar-bubble">
                  {draftAvatarId
                    ? AVATARS[parseInt(draftAvatarId.slice(-2)) - 1]
                    : "👤"}
                </div>
              </div>

              <div className="profile-fields">
                {/* DISPLAY NAME */}
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
                      <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                        disabled={showPassFields}
                      >
                        <Edit2 size={18} color="white" />
                      </button>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={handleConfirmName}
                        disabled={isNameEmpty}
                        title={isNameEmpty ? "Name cannot be empty" : "Confirm name"}
                      >
                        <Check size={18} color={isNameEmpty ? "gray" : "#60a5fa"} />
                      </button>
                    )}
                  </div>
                  {isEditing && isNameEmpty && (
                    <p className="error-text">Username must be completed!</p>
                  )}
                </div>

                {/* Overlay to block interaction while editing */}
                <div style={{ position: "relative" }}>
                  {isAnyEditing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        cursor: "not-allowed",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0,0,0,0.25)",
                      }}
                      title="Complete the current action first"
                    />
                  )}

                  {/* READ-ONLY USERNAME */}
                  <div className="profile-row readonly">
                    <label>{t.labels.username}</label>
                    <span className="value orbitron-text">{profile.username}</span>
                    <span className="input-hint" style={{ fontSize: "0.6rem" }}>
                      {t.labels.uniqueIdCannotBeChanged}
                    </span>
                  </div>

                  {/* RANKING */}
                  <div className="profile-row readonly">
                    <label>{t.labels.ranking}</label>
                    <span className="value orbitron-text">
                      {ranking
                        ? `${ranking.position} / ${ranking.totalPlayers}`
                        : "—"}
                    </span>
                  </div>

                  {/* AVATAR SELECTION */}
                  <div className="profile-row">
                    <label>{t.labels.chooseAvatar}</label>
                    <div className="avatar-grid">
                      {AVATARS.map((emoji, i) => {
                        const id = `avatar_0${i + 1}`;
                        return (
                          <button
                            key={id}
                            className={`avatar-opt ${
                              draftAvatarId === id ? "active" : ""
                            }`}
                            onClick={() => setDraftAvatarId(id)}
                            disabled={isAnyEditing}
                            tabIndex={isAnyEditing ? -1 : 0}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PASSWORD CHANGE SECTION (new feature) */}
                <div className="profile-row">
                  <label>{t.labels.security}</label>
                  {!showPassFields ? (
                    <button
                      className="change-pass-trigger orbitron-text"
                      onClick={() => setShowPassFields(true)}
                      disabled={isEditing}
                    >
                      <Lock size={14} /> {t.buttons.changePassword}
                    </button>
                  ) : (
                    <div className="password-edit-box">
                      <input
                        type="password"
                        placeholder={t.labels.currentPassword}
                        className="orbitron-text small-input"
                        value={passData.current}
                        onChange={(e) =>
                          setPassData({ ...passData, current: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        placeholder={t.labels.newPassword}
                        className="orbitron-text small-input"
                        value={passData.next}
                        onChange={(e) =>
                          setPassData({ ...passData, next: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        placeholder={t.labels.confirmNew}
                        className="orbitron-text small-input"
                        value={passData.confirm}
                        onChange={(e) =>
                          setPassData({ ...passData, confirm: e.target.value })
                        }
                      />
                      {passData.next && passData.confirm && passData.next !== passData.confirm && (
                        <p className="error-text">Passwords do not match!</p>
                      )}
                      <div className="pass-actions">
                        <button
                          className="cancel-pass"
                          onClick={() => {
                            setShowPassFields(false);
                            setPassData({ current: "", next: "", confirm: "" });
                          }}
                        >
                          {t.buttons.cancel}
                        </button>
                        <button
                          className="confirm-pass"
                          disabled={!isPasswordValid}
                          onClick={handlePasswordChange}
                        >
                          {t.buttons.confirm}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="profile-actions-section" style={{ position: "relative" }}>
                {isAnyEditing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 10,
                      cursor: "not-allowed",
                      borderRadius: "8px",
                      backgroundColor: "rgba(0,0,0,0.25)",
                    }}
                    title="Complete the current action first"
                  />
                )}
                <button
                  className="main-button btn-blue history-btn orbitron-text"
                  onClick={() => navigate("/history")}
                  disabled={isAnyEditing}
                >
                  {t.buttons.accessGameHistory}
                </button>

                <div className="btn-group">
                  <button
                    className="main-button orbitron-text"
                    onClick={resetDraft}
                    disabled={!dirty || isAnyEditing}
                  >
                    {t.buttons.reset}
                  </button>
                  <button
                    className="main-button btn-blue orbitron-text"
                    onClick={save}
                    disabled={!dirty || isNameEmpty || isAnyEditing}
                  >
                    {t.buttons.save}
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};