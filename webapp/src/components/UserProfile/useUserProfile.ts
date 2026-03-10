
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserProfile, UserRanking } from "./userProfile.type";
import { getMyProfile, getMyRanking, updateMyProfile } from "./userProfile.api";

export function useUserProfile(open: boolean) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ranking, setRanking] = useState<UserRanking | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftName, setDraftName] = useState("");
  const [draftAvatarId, setDraftAvatarId] = useState("");

  const dirty = useMemo(() => {
    if (!profile) return false;
    return draftName !== profile.displayName || draftAvatarId !== profile.avatarId;
  }, [profile, draftName, draftAvatarId]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);

    Promise.all([getMyProfile(), getMyRanking()])
      .then(([p, r]) => {
        setProfile(p);
        setRanking(r);
        setDraftName(p.displayName);
        setDraftAvatarId(p.avatarId);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, [open]);

  const save = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    try {
      const updated = await updateMyProfile({
        displayName: draftName.trim(),
        avatarId: draftAvatarId,
      });
      setProfile(updated);
      setDraftName(updated.displayName);
      setDraftAvatarId(updated.avatarId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [profile, draftName, draftAvatarId]);

  const resetDraft = useCallback(() => {
    if (!profile) return;
    setDraftName(profile.displayName);
    setDraftAvatarId(profile.avatarId);
  }, [profile]);

  return {
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
  };
}

