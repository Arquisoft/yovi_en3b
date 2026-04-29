const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Match {
  id: string;
  blue_player_id: string;
  red_player_id?: string | null;
  is_bot: boolean;
  bot_difficulty?: number;
  status: string;
}

/**
 * Create a new match in the database
 * @param isBot - whether playing against a bot
 * @param difficulty - bot difficulty level (1-3), required if isBot is true
 * @returns Match object with id
 */
export async function createMatch(
  isBot: boolean,
  difficulty?: number
): Promise<Match> {
  const userId = localStorage.getItem("userId");
  console.log('createMatch - userId from localStorage:', userId);

  if (!userId) {
    throw new Error("User ID not found. Please log in again.");
  }

  const body: any = {
    bluePlayerId: userId,
    isBot,
  };

  if (isBot) {
    if (difficulty === undefined  || difficulty < 0 || difficulty > 2) {
      throw new Error("Bot difficulty is required for bot matches");
    }
    body.botDifficulty = difficulty;
  }

  const res = await fetch(`${API_URL}/matches/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { error: `${res.status} ${res.statusText}` };
    }
    throw new Error(error.error || `Failed to create match (${res.status})`);
  }

  const data = await res.json();
  return data.match;
}

/**
 * Finish a match and record the winner
 * @param matchId - ID of the match to finish
 * @param winnerId - ID of the player who won
 * @returns Updated match object
 */
export async function finishMatch(
  matchId: string,
  winnerId: string | null
): Promise<Match> {
  const res = await fetch(`${API_URL}/matches/finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      matchId,
      winnerId,
    }),
  });

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { error: `${res.status} ${res.statusText}` };
    }
    throw new Error(error.error || `Failed to finish match (${res.status})`);
  }

  const data = await res.json();
  return data.match;
}


/**
 * Evaluate the board tension by asking the Node/Rust backend
 * @param boardPayload - The JSON representation of the YEN board
 * @returns The blue and red scores
 */
export async function evaluateBoard(boardPayload: any): Promise<{blue_score: number, red_score: number}> {
  const res = await fetch(`${API_URL}/matches/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boardPayload),
  });

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { error: `${res.status} ${res.statusText}` };
    }
    throw new Error(error.error || `Failed to evaluate board (${res.status})`);
  }

  return await res.json();
}

/**
 * Get the bot's next move
 * @param position - JSON string of the board state
 * @param botId - The bot identifier
 * @returns The coordinates for the bot's move
 */
export async function getBotMove(position: string, botId: string): Promise<{x: number, y: number, z: number}> {
  const res = await fetch(`${API_URL}/play?position=${encodeURIComponent(position)}&bot_id=${botId}`, {
    method: "GET",
  });

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { error: `${res.status} ${res.statusText}` };
    }
    throw new Error(error.error || `Failed to get bot move (${res.status})`);
  }

  const data = await res.json();
  return data.coords;
}