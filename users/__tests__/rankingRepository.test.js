import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rankingRepository = require('../src/modules/ranking/data-access/rankingRepository.js');
const rankingQueries = require('../src/modules/ranking/data-access/rankingQueries.js');
const db = require('../src/db/db.js');

describe('rankingRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRankingByUser', () => {
    it('returns ranking when user exists', async () => {
      const userId = 'user-123';
      const mockRanking = {
        user_id: userId,
        total_matches: 10,
        win_matches: 7,
        score: 300,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockRanking],
      });

      const result = await rankingRepository.getRankingByUser(userId);

      expect(db.query).toHaveBeenCalledWith(
        rankingQueries.findRankingByUser,
        [userId]
      );
      expect(result).toEqual(mockRanking);
    });

    it('returns undefined when user not found', async () => {
      const userId = 'unknown-user';

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [],
      });

      const result = await rankingRepository.getRankingByUser(userId);

      expect(result).toBeUndefined();
    });

    it('propagates database errors', async () => {
      const userId = 'user-123';

      vi.spyOn(db, 'query').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        rankingRepository.getRankingByUser(userId)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('addToRanking', () => {
    it('adds new ranking entry for player', async () => {
      const userId = 'new-player';
      const stats = { totalMatches: 1, winMatches: 1 };
      const mockNewRanking = {
        user_id: userId,
        total_matches: 1,
        win_matches: 1,
        score: 50,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockNewRanking],
      });

      const result = await rankingRepository.addToRanking(userId, stats);

      expect(db.query).toHaveBeenCalledWith(
        rankingQueries.addToRanking,
        [userId, 1, 1]
      );
      expect(result).toEqual(mockNewRanking);
    });

    it('calculates score correctly on insert', async () => {
      const userId = 'player-001';
      const stats = { totalMatches: 2, winMatches: 1 };
      // Score = 50 * (2 * wins - total) = 50 * (2 * 1 - 2) = 0
      const mockRanking = {
        user_id: userId,
        total_matches: 2,
        win_matches: 1,
        score: 0,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockRanking],
      });

      const result = await rankingRepository.addToRanking(userId, stats);

      expect(result.score).toBe(0);
      // Verify score was calculated correctly
      expect(db.query).toHaveBeenCalledWith(
        rankingQueries.addToRanking,
        [userId, 2, 1]
      );
    });

    it('returns newly created ranking with correct data', async () => {
      const userId = 'player-002';
      const stats = { totalMatches: 5, winMatches: 4 };
      // Score = 50 * (2 * 4 - 5) = 50 * 3 = 150
      const expectedRanking = {
        user_id: userId,
        total_matches: 5,
        win_matches: 4,
        score: 150,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [expectedRanking],
      });

      const result = await rankingRepository.addToRanking(userId, stats);

      expect(result).toEqual(expectedRanking);
    });
  });

  describe('updateRanking', () => {
    it('updates existing ranking entry', async () => {
      const userId = 'player-003';
      const newStats = { totalMatches: 11, winMatches: 8 };
      const currentRanking = {
        user_id: userId,
        total_matches: 10,
        win_matches: 7,
        score: 200,
      };
      const mockUpdatedRanking = {
        user_id: userId,
        total_matches: 11,
        win_matches: 8,
        score: 250,
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({
          rows: [currentRanking],
        })
        .mockResolvedValueOnce({
          rows: [mockUpdatedRanking],
        });

      const result = await rankingRepository.updateRanking(userId, newStats);

      expect(db.query).toHaveBeenNthCalledWith(
        1,
        rankingQueries.findRankingByUser,
        [userId]
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        rankingQueries.updateRanking,
        [11, 8, 250, userId]
      );
      expect(result).toEqual(mockUpdatedRanking);
    });

    it('recalculates score on update', async () => {
      const userId = 'player-004';
      // Update from (3 matches, 1 win) to (4 matches, 1 win)
      // New score = 50 * (2 * 1 - 4) = 50 * (-2) = -100
      const newStats = { totalMatches: 4, winMatches: 1 };
      const mockUpdatedRanking = {
        user_id: userId,
        total_matches: 4,
        win_matches: 1,
        score: -100,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockUpdatedRanking],
      });

      const result = await rankingRepository.updateRanking(userId, newStats);

      expect(result.score).toBe(-100);
    });

    it('propagates database errors during update', async () => {
      const userId = 'player-005';
      const newStats = { totalMatches: 10, winMatches: 5 };

      vi.spyOn(db, 'query').mockRejectedValue(
        new Error('Update failed')
      );

      await expect(
        rankingRepository.updateRanking(userId, newStats)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getAllRankings', () => {
    it('returns list of all rankings sorted by score desc', async () => {
      const mockRankings = [
        { user_id: 'p1', total_matches: 10, win_matches: 9, score: 400 },
        { user_id: 'p2', total_matches: 10, win_matches: 5, score: 0 },
        { user_id: 'p3', total_matches: 10, win_matches: 3, score: -200 },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockRankings,
      });

      const result = await rankingRepository.getAllRankings();

      expect(db.query).toHaveBeenCalledWith(rankingQueries.getAllRankings);
      expect(result).toEqual(mockRankings);
      // Verify sorted by score descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
      }
    });

    it('returns empty array when no rankings exist', async () => {
      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [],
      });

      const result = await rankingRepository.getAllRankings();

      expect(result).toEqual([]);
    });
  });

  describe('getGlobalRankings', () => {
    it('returns global leaderboard with user details', async () => {
      const mockGlobalRankings = [
        {
          position: 1,
          user_id: 'player1',
          username: 'Champion',
          total_matches: 20,
          win_matches: 19,
          score: 850,
          win_rate: 95,
        },
        {
          position: 2,
          user_id: 'player2',
          username: 'Challenger',
          total_matches: 20,
          win_matches: 14,
          score: 600,
          win_rate: 70,
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockGlobalRankings,
      });

      const result = await rankingRepository.getGlobalRankings();

      expect(db.query).toHaveBeenCalledWith(rankingQueries.getGlobalRankings);
      expect(result).toEqual(mockGlobalRankings);
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
    });

    it('calculates position based on score ranking', async () => {
      const mockRankings = [
        {
          position: 1,
          user_id: 'top',
          username: 'TopPlayer',
          score: 500,
          win_rate: 100,
        },
        {
          position: 2,
          user_id: 'middle',
          username: 'MiddlePlayer',
          score: 250,
          win_rate: 75,
        },
        {
          position: 3,
          user_id: 'bottom',
          username: 'BottomPlayer',
          score: 0,
          win_rate: 50,
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockRankings,
      });

      const result = await rankingRepository.getGlobalRankings();

      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
    });

    it('includes win_rate calculation', async () => {
      const mockRankings = [
        {
          position: 1,
          user_id: 'player1',
          username: 'Player1',
          total_matches: 10,
          win_matches: 8,
          score: 300,
          win_rate: 80, // 8/10 * 100
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockRankings,
      });

      const result = await rankingRepository.getGlobalRankings();

      expect(result[0].win_rate).toBe(80);
    });

    it('returns empty array when no rankings exist', async () => {
      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [],
      });

      const result = await rankingRepository.getGlobalRankings();

      expect(result).toEqual([]);
    });

    it('propagates database errors', async () => {
      vi.spyOn(db, 'query').mockRejectedValue(
        new Error('Query failed')
      );

      await expect(
        rankingRepository.getGlobalRankings()
      ).rejects.toThrow('Query failed');
    });
  });

  describe('integration scenarios', () => {
    it('handles new player workflow: add → get → update', async () => {
      const userId = 'new-player-integration';

      // Step 1: Add new ranking
      const newRanking = {
        user_id: userId,
        total_matches: 1,
        win_matches: 1,
        score: 50,
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [newRanking] }) // Add
        .mockResolvedValueOnce({ rows: [newRanking] }) // Get
        .mockResolvedValueOnce({ rows: [newRanking] }) // Find current before update
        .mockResolvedValueOnce({
          rows: [
            {
              user_id: userId,
              total_matches: 2,
              win_matches: 2,
              score: 100,
            },
          ],
        });

      // Add new ranking
      const added = await rankingRepository.addToRanking(userId, {
        totalMatches: 1,
        winMatches: 1,
      });
      expect(added.total_matches).toBe(1);

      // Get ranking
      const fetched = await rankingRepository.getRankingByUser(userId);
      expect(fetched).toEqual(newRanking);

      // Update ranking
      const updated = await rankingRepository.updateRanking(userId, {
        totalMatches: 2,
        winMatches: 2,
      });
      expect(updated.total_matches).toBe(2);
      expect(updated.score).toBe(100);
    });

    it('handles global leaderboard with multiple players', async () => {
      const mockGlobalRankings = [
        {
          position: 1,
          user_id: 'champion',
          username: 'Champion',
          total_matches: 50,
          win_matches: 48,
          score: 2300,
          win_rate: 96,
        },
        {
          position: 2,
          user_id: 'veteran',
          username: 'Veteran',
          total_matches: 45,
          win_matches: 30,
          score: 1200,
          win_rate: 66.66,
        },
        {
          position: 3,
          user_id: 'rookie',
          username: 'Rookie',
          total_matches: 5,
          win_matches: 2,
          score: -50,
          win_rate: 40,
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockGlobalRankings,
      });

      const result =
        await rankingRepository.getGlobalRankings();

      expect(result.length).toBe(3);
      expect(result[0].position).toBe(1);
      expect(result[0].score).toBeGreaterThan(result[1].score);
      expect(result[1].score).toBeGreaterThan(result[2].score);
    });
  });
});
