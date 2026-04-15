export const AVATAR_OPTIONS = ["🧩", "🎮", "🚀", "🏆", "🦊", "🐙"] as const;

export function getAvatarGlyph(avatarId?: string | null): string {
  if (!avatarId) {
    return "👤";
  }

  const parsedIndex = Number.parseInt(avatarId.slice(-2), 10) - 1;

  if (Number.isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= AVATAR_OPTIONS.length) {
    return "👤";
  }

  return AVATAR_OPTIONS[parsedIndex];
}
