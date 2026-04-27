import { getMyProfile } from "../UserProfile/userProfile.api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type MatchHistoryEntry = {
  id: string;
  date: string;
  result: "win" | "lose";
  size: number | null;
  opponent: string;
  isBot: boolean;
  opponentAvatarId: string | null;
  status: string;
};

export async function getMyMatchHistory(): Promise<MatchHistoryEntry[]> {
  const profile = await getMyProfile();

  const response = await fetch(`${API_URL}/matches/history/${profile.id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Could not load match history");
  }

  return (await response.json()) as MatchHistoryEntry[];
}
