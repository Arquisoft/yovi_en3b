import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileOverlay.css";
import { useUserProfile } from "./useUserProfile";
import { AvatarPicker, getAvatarBadge } from "./AvatarPicker";
import { EditableField } from "./EditableField";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProfileOverlay({ open, onClose }: Props) {
  const navigate = useNavigate();
  const {
    profile,
    ranking,
    loading,
    saving,
    error,
    draftName,
    setDraftName,
    draftAvatarId,
    setDraftAvatarId,
    dirty,
    save,
    resetDraft,
  } = useUserProfile(open);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="profile-backdrop" onMouseDown={onClose}>
      <div className="profile-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>User Profile</h2>
          <button 
            className="profile-close" 
            type="button" 
            onClick={onClose} 
            aria-label="Close"
          >
            {/* Vacío - la X viene del CSS ::after */}
          </button>
        </div>

        {loading ? (
          <div className="muted">Loading profile...</div>
        ) : error ? (
          <div style={{ color: "#c53030", fontWeight: 700 }}>
            {error}
            <div className="muted" style={{ marginTop: 6 }}>
              You can keep the panel open and try again later.
            </div>
          </div>
        ) : profile ? (
          <>
            <div className="profile-avatar" aria-label="Avatar">
              {getAvatarBadge(draftAvatarId)}
            </div>

            <div className="profile-section">
              {/* ✅ EditableField YA trae su propio .profile-row */}
              <EditableField
                label="Display Name"
                value={draftName}
                onChange={setDraftName}
                maxLength={20}
                helperText="Editable nickname shown in the UI."
              />

              {/* ✅ Username y Ranking usan .profile-row manual */}
              <div className="profile-row readonly">
                <label>Username</label>
                <div className="value">{profile.username}</div>
                <div className="muted">Read-only unique identifier.</div>
              </div>

              <div className="profile-row readonly">
                <label>Ranking</label>
                <div className="value">
                  {ranking ? (
                    <>
                      {ranking.position}
                      {ranking.totalPlayers ? ` / ${ranking.totalPlayers}` : ""}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="muted">Read-only (computed).</div>
              </div>

              {/* ✅ Avatar también su propio .profile-row */}
              <div className="profile-row">
                <label>Choose Avatar</label>
                <AvatarPicker value={draftAvatarId} onChange={setDraftAvatarId} />
                <div className="muted">Predefined avatars for MVP.</div>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="primary-btn wide"
                onClick={() => navigate("/history")}
              >
                Access Game History
              </button>

              <div className="profile-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetDraft}
                  disabled={!dirty || saving}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={save}
                  disabled={!dirty || saving || draftName.trim().length === 0}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="muted">No profile data available.</div>
        )}
      </div>
    </div>
  );
}