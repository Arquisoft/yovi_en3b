import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rankingRepo = require('../src/modules/ranking/data-access/rankingRepository.js');
const rankingService = require('../src/modules/ranking/domain/rankingService.js');

describe('rankingService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('addStats delegates to repository', async () => {
    vi.spyOn(rankingRepo, 'addToRanking').mockResolvedValue({ user_id: 'u1' });

    const result = await rankingService.addStats('u1', { totalMatches: 1, winMatches: 1 });

    expect(rankingRepo.addToRanking).toHaveBeenCalledWith('u1', { totalMatches: 1, winMatches: 1 });
    expect(result.user_id).toBe('u1');
  });

  it('setStats delegates to repository', async () => {
    vi.spyOn(rankingRepo, 'updateRanking').mockResolvedValue({ user_id: 'u2' });

    const result = await rankingService.setStats('u2', { totalMatches: 2, winMatches: 1 });

    expect(rankingRepo.updateRanking).toHaveBeenCalledWith('u2', { totalMatches: 2, winMatches: 1 });
    expect(result.user_id).toBe('u2');
  });

  it('getRanking delegates to repository', async () => {
    vi.spyOn(rankingRepo, 'getRankingByUser').mockResolvedValue({ user_id: 'u3' });

    const result = await rankingService.getRanking('u3');

    expect(rankingRepo.getRankingByUser).toHaveBeenCalledWith('u3');
    expect(result.user_id).toBe('u3');
  });

  describe('getUserRankingPosition', () => {
    it('returns correct position for user in rankings', async () => {
      const mockRankings = [
        { user_id: 'u1', score: 500 },
        { user_id: 'u2', score: 400 },
        { user_id: 'u3', score: 300 },
      ];
      vi.spyOn(rankingRepo, 'getAllRankings').mockResolvedValue(mockRankings);

      const result = await rankingService.getUserRankingPosition('u2');

      expect(result.position).toBe(2);
      expect(result.totalPlayers).toBe(3);
    });

    it('returns position 1 for first ranked player', async () => {
      const mockRankings = [
        { user_id: 'u1', score: 500 },
        { user_id: 'u2', score: 400 },
      ];
      vi.spyOn(rankingRepo, 'getAllRankings').mockResolvedValue(mockRankings);

      const result = await rankingService.getUserRankingPosition('u1');

      expect(result.position).toBe(1);
      expect(result.totalPlayers).toBe(2);
    });

    it('returns null when user not found in rankings', async () => {
      const mockRankings = [
        { user_id: 'u1', score: 500 },
        { user_id: 'u2', score: 400 },
      ];
      vi.spyOn(rankingRepo, 'getAllRankings').mockResolvedValue(mockRankings);

      const result = await rankingService.getUserRankingPosition('u_unknown');

      expect(result).toBeNull();
    });

    it('handles empty rankings', async () => {
      vi.spyOn(rankingRepo, 'getAllRankings').mockResolvedValue([]);

      const result = await rankingService.getUserRankingPosition('u1');

      expect(result).toBeNull();
    });
  });

  describe('getGlobalRanking', () => {
    it('delegates to repository', async () => {
      const mockGlobalRankings = [
        { position: 1, user_id: 'u1', score: 500, win_rate: 100 },
        { position: 2, user_id: 'u2', score: 400, win_rate: 90 },
      ];
      vi.spyOn(rankingRepo, 'getGlobalRankings').mockResolvedValue(mockGlobalRankings);

      const result = await rankingService.getGlobalRanking();

      expect(rankingRepo.getGlobalRankings).toHaveBeenCalled();
      expect(result).toEqual(mockGlobalRankings);
    });

    it('returns empty array when no rankings', async () => {
      vi.spyOn(rankingRepo, 'getGlobalRankings').mockResolvedValue([]);

      const result = await rankingService.getGlobalRanking();

      expect(result).toEqual([]);
    });
  });

  describe('updateOrInitializeRanking', () => {
    it('initializes new ranking for first-time player', async () => {
      const userId = 'new_user';
      const mockNewRanking = { user_id: userId, total_matches: 1, win_matches: 1, score: 50 };

      vi.spyOn(rankingRepo, 'getRankingByUser').mockResolvedValue(undefined);
      vi.spyOn(rankingRepo, 'addToRanking').mockResolvedValue(mockNewRanking);

      const result = await rankingService.updateOrInitializeRanking(userId, 1, 1);

      expect(rankingRepo.addToRanking).toHaveBeenCalledWith(userId, { totalMatches: 1, winMatches: 1 });
      expect(result.user_id).toBe(userId);
      expect(result.win_matches).toBe(1);
    });

    it('updates existing ranking with accumulated stats', async () => {
      const userId = 'existing_user';
      const existingRanking = { user_id: userId, total_matches: 5, win_matches: 3 };
      const updatedRanking = { user_id: userId, total_matches: 6, win_matches: 4, score: 200 };

      vi.spyOn(rankingRepo, 'getRankingByUser').mockResolvedValue(existingRanking);
      vi.spyOn(rankingRepo, 'updateRanking').mockResolvedValue(updatedRanking);

      const result = await rankingService.updateOrInitializeRanking(userId, 1, 1);

      expect(rankingRepo.updateRanking).toHaveBeenCalledWith(userId, {
        totalMatches: 6,
        winMatches: 4,
      });
      expect(result.total_matches).toBe(6);
      expect(result.win_matches).toBe(4);
    });

    it('handles loss for existing player', async () => {
      const userId = 'existing_user';
      const existingRanking = { user_id: userId, total_matches: 5, win_matches: 3 };
      const updatedRanking = { user_id: userId, total_matches: 6, win_matches: 3, score: 150 };

      vi.spyOn(rankingRepo, 'getRankingByUser').mockResolvedValue(existingRanking);
      vi.spyOn(rankingRepo, 'updateRanking').mockResolvedValue(updatedRanking);

      const result = await rankingService.updateOrInitializeRanking(userId, 1, 0);

      expect(rankingRepo.updateRanking).toHaveBeenCalledWith(userId, {
        totalMatches: 6,
        winMatches: 3,
      });
      expect(result.win_matches).toBe(3);
    });

    it('throws error when database fails', async () => {
      const userId = 'error_user';
      vi.spyOn(rankingRepo, 'getRankingByUser').mockRejectedValue(new Error('DB Error'));

      await expect(rankingService.updateOrInitializeRanking(userId, 1, 1))
        .rejects
        .toThrow('Failed to update or initialize ranking');
    });
  });
});

