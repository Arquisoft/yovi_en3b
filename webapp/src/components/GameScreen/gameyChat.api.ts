export type GameChatMessage = {
  sender: 'player' | 'bot';
  text: string;
};

type YENPayload = {
  size: number;
  turn: number;
  players: string[];
  layout: string;
};

type GameyChatRequest = {
  yen: YENPayload;
  messages: Array<{ role: string; content: string }>;
};

type GameyChatResponse = {
  api_version: string;
  bot_id: string;
  difficulty: string;
  reply: string;
};

/**
 * Converts a 3D game board state into a compact YEN notation string.
 *
 * This function transforms the board's 3D coordinate system into a serializable
 * string format that represents the current game state. The board layout is built
 * row by row, where each row contains cells representing player positions. The
 * resulting format uses backward slashes to separate rows and characters to mark
 * cell ownership: 'B' for Blue player (owner 1), 'R' for Red player (owner 2),
 * and '.' for empty cells.
 *
 * @param size - The board dimensions (board is triangular with base of size)
 * @param boardState - Object mapping 3D coordinates (as "x-y-z" strings) to owner values
 *                     (1 for Blue, 2 for Red, undefined for empty)
 * @returns A string representation of the board layout using format like "B.R/..B./..."
 *
 * @example
 * const boardState = { "2-0-2": 1, "2-1-1": 2, "2-2-0": 1 };
 * const layout = buildYenLayout(3, boardState);
 * // Returns something like "B/R.B/..."
 */
export function buildYenLayout(
  size: number,
  boardState: Record<string, number>,
): string {
  const rows: string[] = [];
  for (let row = 0; row < size; row += 1) {
    const x = size - 1 - row;
    let rowStr = '';
    for (let y = 0; y <= row; y += 1) {
      const z = row - y;
      const key = `${x}-${y}-${z}`;
      const owner = boardState[key];
      if (owner === 1) rowStr += 'B';
      else if (owner === 2) rowStr += 'R';
      else rowStr += '.';
    }
    rows.push(rowStr);
  }
  return rows.join('/');
}

/**
 * Requests a bot chat reply from the Gamey service.
 *
 * This function communicates with the Gamey bot server to get an AI-generated
 * response in the context of an ongoing game. It sends the current game state
 * (board layout, turn number, players) along with the conversation history,
 * and receives a text reply from the bot. The bot's difficulty level and ID
 * can be customized to select different bot behaviors.
 *
 * @param params - Configuration object containing:
 *   @param params.size - Board size
 *   @param params.currentPlayer - The current player's turn (1-based index)
 *   @param params.boardState - Current board state mapping coordinates to owners
 *   @param params.messages - Conversation history between player and bot
 *   @param params.difficulty - Bot difficulty level ('easy', 'medium', or 'hard')
 *   @param params.botId - Optional bot identifier (defaults to 'llm_bot')
 *
 * @returns Promise resolving to the bot's chat reply as a string
 *
 * @throws Error if the HTTP request fails or the server returns an error status
 *
 * @example
 * const reply = await requestBotChatReply({
 *   size: 3,
 *   currentPlayer: 1,
 *   boardState: { "2-0-2": 1 },
 *   messages: [{ sender: 'player', text: 'Hello!' }],
 *   difficulty: 'hard',
 *   botId: 'llm_bot'
 * });
 */
export async function requestBotChatReply(params: {
  size: number;
  currentPlayer: number;
  boardState: Record<string, number>;
  messages: GameChatMessage[];
  difficulty: 'easy' | 'medium' | 'hard';
  botId?: string;
}): Promise<string> {
  const GAMEY_URL = import.meta.env.VITE_GAMEY_URL ?? 'http://localhost:3001';
  const botId = params.botId ?? 'llm_bot';

  const body: GameyChatRequest = {
    yen: {
      size: params.size,
      turn: Math.max(0, params.currentPlayer - 1),
      players: ['B', 'R'],
      layout: buildYenLayout(params.size, params.boardState),
    },
    messages: params.messages.map((m) => ({
      role: m.sender === 'player' ? 'player' : 'assistant',
      content: m.text,
    })),
  };

  const response = await fetch(
    `${GAMEY_URL}/v1/ybot/chat/${botId}?difficulty=${params.difficulty}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Gamey chat request failed (${response.status})`);
  }

  const data = (await response.json()) as GameyChatResponse;
  return data.reply;
}

