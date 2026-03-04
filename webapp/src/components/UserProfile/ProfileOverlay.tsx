import React, { useEffect, useRef, useState } from "react";
import { X, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import "./ProfileOverlay.css";

interface ProfileOverlayProps { open: boolean; onClose: () => void; }

const AVATARS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"];

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    profile, ranking, loading, error,
    draftName, setDraftName,
    draftAvatarId, setDraftAvatarId,
    dirty, save, resetDraft
  } = useUserProfile(open);

  const isNameEmpty = draftName.trim() === "";

  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleConfirmName = () => {
    if (isNameEmpty) return; // Prevent confirming with empty name
    setIsEditing(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={isEditing ? undefined : onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>

        {/* Prevent closing while editing */}
        <button
          className="close-modal"
          onClick={isEditing ? undefined : onClose}
          disabled={isEditing}
        >
          <X size={35} />
        </button>

        <h2 className="modal-title">USER PROFILE</h2>

        {loading ? (
          <div className="loading-text">LOADING...</div>
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

              {/* DISPLAY NAME — always interactive */}
              <div className="profile-row">
                <label>DISPLAY NAME</label>
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

              {/* Overlay to block interaction with everything else while editing */}
              <div style={{ position: "relative" }}>
                {isEditing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 10,
                      cursor: "not-allowed",
                      borderRadius: "8px",
                      backgroundColor: "rgba(0,0,0,0.25)",
                    }}
                    title="Confirm the display name first"
                  />
                )}

                <div className="profile-row readonly">
                  <label>USERNAME</label>
                  <span className="value orbitron-text">{profile.username}</span>
                </div>

                <div className="profile-row readonly">
                  <label>RANKING</label>
                  <span className="value orbitron-text">
                    {ranking ? `${ranking.position} / ${ranking.totalPlayers}` : "—"}
                  </span>
                </div>

                <div className="profile-row">
                  <label>CHOOSE AVATAR</label>
                  <div className="avatar-grid">
                    {AVATARS.map((emoji, i) => {
                      const id = `avatar_0${i + 1}`;
                      return (
                        <button
                          key={id}
                          className={`avatar-opt ${draftAvatarId === id ? "active" : ""}`}
                          onClick={() => setDraftAvatarId(id)}
                          disabled={isEditing}
                          tabIndex={isEditing ? -1 : 0}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="profile-actions-section"
              style={{ position: "relative" }}
            >
              {isEditing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    cursor: "not-allowed",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0,0,0,0.25)",
                  }}
                  title="Confirm the display name first"
                />
              )}
              <button
                className="main-button btn-blue history-btn orbitron-text"
                onClick={() => navigate("/history")}
                disabled={isEditing}
              >
                ACCESS GAME HISTORY
              </button>

              <div className="btn-group">
                <button
                  className="main-button orbitron-text"
                  onClick={resetDraft}
                  disabled={!dirty || isEditing}
                >
                  RESET
                </button>
                <button
                  className="main-button btn-blue orbitron-text"
                  onClick={save}
                  disabled={!dirty || isNameEmpty || isEditing}
                >
                  SAVE
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};