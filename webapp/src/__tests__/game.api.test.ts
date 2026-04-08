import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMatch, finishMatch } from '../components/GameScreen/game.api';

describe('game API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  it('throws when no userId is available for match creation', async () => {
    await expect(createMatch(false)).rejects.toThrow('User ID not found. Please log in again.');
  });

  it('throws when bot match difficulty is missing', async () => {
    localStorage.setItem('userId', 'user-1');

    await expect(createMatch(true)).rejects.toThrow('Bot difficulty is required for bot matches');
  });

  it('creates a match with the expected payload', async () => {
    localStorage.setItem('userId', 'user-7');

    const match = {
      id: 'match-1',
      blue_player_id: 'user-7',
      is_bot: true,
      bot_difficulty: 2,
      status: 'in_progress',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ match }),
    } as Response);

    await expect(createMatch(true, 2)).resolves.toEqual(match);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/matches/create',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          bluePlayerId: 'user-7',
          isBot: true,
          botDifficulty: 2,
        }),
      })
    );
  });

  it('surfaces backend errors during match creation', async () => {
    localStorage.setItem('userId', 'user-9');

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Creation failed' }),
    } as Response);

    await expect(createMatch(false)).rejects.toThrow('Creation failed');
  });

  it('finishes a match and returns backend data', async () => {
    const match = {
      id: 'match-2',
      blue_player_id: 'user-1',
      red_player_id: 'user-2',
      is_bot: false,
      status: 'finished',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ match }),
    } as Response);

    await expect(finishMatch('match-2', 'user-1')).resolves.toEqual(match);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/matches/finish',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-2',
          winnerId: 'user-1',
        }),
      })
    );
  });

  it('falls back to the status text when finishing a match fails without JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(finishMatch('match-3', 'user-1')).rejects.toThrow('500 Server Error');
  });
});
