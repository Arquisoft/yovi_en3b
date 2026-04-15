import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGlobalRanking } from '../components/RankingScreen/ranking.api';

describe('ranking API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('maps backend ranking entries into UI data with fallbacks', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ranking: [
            {
              user_id: 'u1',
              position: 1,
              username: 'champion',
              nickname: null,
              avatarId: null,
              score: 500,
              win_rate: 90,
              total_matches: 10,
              last_game_won: true,
            },
            {
              user_id: 'u2',
              position: 2,
              username: 'challenger',
              nickname: 'Challenger',
              avatarId: 'avatar_05',
              score: 400,
              win_rate: 75,
              total_matches: 12,
              last_game_won: false,
            },
          ],
        }),
    } as Response);

    await expect(getGlobalRanking()).resolves.toEqual([
      {
        id: 'u1',
        position: 1,
        username: 'champion',
        displayName: 'champion',
        avatarId: 'avatar_01',
        points: 500,
        winRate: 90,
        gamesPlayed: 10,
        lastGameWon: true,
      },
      {
        id: 'u2',
        position: 2,
        username: 'challenger',
        displayName: 'Challenger',
        avatarId: 'avatar_05',
        points: 400,
        winRate: 75,
        gamesPlayed: 12,
        lastGameWon: false,
      },
    ]);
  });

  it('throws when the ranking endpoint fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(getGlobalRanking()).rejects.toThrow('Could not load the overall ranking');
  });
});
