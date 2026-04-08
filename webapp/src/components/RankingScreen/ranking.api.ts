const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type GlobalRankingEntry = {
  id: string;
  position: number;
  username: string;
  displayName: string;
  avatarId: string;
  points: number;
  winRate: number;
  gamesPlayed: number;
  lastGameWon: boolean;
};

type GlobalRankingResponse = {
  ranking: Array<{
    user_id: string;
    position: number;
    username: string;
    nickname: string | null;
    photo: string | null;
    score: number;
    win_rate: number;
    total_matches: number;
    last_game_won: boolean;
  }>;
};

export async function getGlobalRanking(): Promise<GlobalRankingEntry[]> {
  const response = await fetch(`${API_URL}/ranking/global`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Could not load the overall ranking");
  }

  const data = (await response.json()) as GlobalRankingResponse;

  return data.ranking.map((entry) => ({
    id: entry.user_id,
    position: entry.position,
    username: entry.username,
    displayName: entry.nickname || entry.username,
    avatarId: entry.photo || "avatar_01",
    points: entry.score,
    winRate: entry.win_rate,
    gamesPlayed: entry.total_matches,
    lastGameWon: entry.last_game_won,
  }));
}
