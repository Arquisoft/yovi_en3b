import styles from "./AvatarPicker.module.css";

const AVATARS = [
  { id: "avatar_01", label: "Avatar 1", emoji: "🧩" },
  { id: "avatar_02", label: "Avatar 2", emoji: "🎮" },
  { id: "avatar_03", label: "Avatar 3", emoji: "🚀" },
  { id: "avatar_04", label: "Avatar 4", emoji: "🏆" },
  { id: "avatar_05", label: "Avatar 5", emoji: "🦊" },
  { id: "avatar_06", label: "Avatar 6", emoji: "🐙" },
];

export function getAvatarBadge(avatarId: string) {
  return AVATARS.find(a => a.id === avatarId)?.emoji ?? "👤";
}

type Props = {
  value: string;
  onChange: (avatarId: string) => void;
};

export function AvatarPicker({ value, onChange }: Props) {
  return (
    <div className={styles.container}>
      {AVATARS.map((a) => {
        const selected = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            title={a.label}
            aria-pressed={selected}
            className={`${styles.button} ${selected ? styles.selected : ""}`}
          >
            {a.emoji}
          </button>
        );
      })}
    </div>
  );
}
