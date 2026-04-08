import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const matchRepository = require('../src/modules/match/data-access/matchRepository.js');
const matchQueries = require('../src/modules/match/data-access/matchQueries.js');
const db = require('../src/db/db.js');

describe('matchRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('finishMatch', () => {
    it('updates match with winner and finished status', async () => {
      const matchId = 'match-001';
      const winnerId = 'player-blue';

      const mockFinishedMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: 'player-red',
        winner_id: winnerId,
        status: 'finished',
        ended_at: '2024-01-15T10:30:00Z',
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockFinishedMatch],
      });

      const result = await matchRepository.finishMatch(matchId, winnerId);

      expect(db.query).toHaveBeenCalledWith(
        matchQueries.finishMatch,
        [winnerId, matchId]
      );
      expect(result).toEqual(mockFinishedMatch);
      expect(result.winner_id).toBe(winnerId);
      expect(result.status).toBe('finished');
    });

    it('returns finished match with updated timestamp', async () => {
      const matchId = 'match-002';
      const winnerId = 'player-red';
      const currentTime = '2024-01-15T11:00:00Z';

      const mockMatch = {
        id: matchId,
        blue_player_id: 'player-blue',
        red_player_id: winnerId,
        winner_id: winnerId,
        status: 'finished',
        ended_at: currentTime,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockMatch],
      });

      const result = await matchRepository.finishMatch(matchId, winnerId);

      expect(result.ended_at).toBe(currentTime);
    });

    it('propagates database errors', async () => {
      const matchId = 'match-error';
      const winnerId = 'player-id';

      vi.spyOn(db, 'query').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        matchRepository.finishMatch(matchId, winnerId)
      ).rejects.toThrow('Database connection failed');
    });

    it('handles match with only winner (bot match)', async () => {
      const matchId = 'bot-match-001';
      const playerId = 'human-player';

      const mockBotMatch = {
        id: matchId,
        blue_player_id: playerId,
        red_player_id: null, // Bot match has no red player
        winner_id: playerId,
        status: 'finished',
        is_bot: true,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockBotMatch],
      });

      const result = await matchRepository.finishMatch(matchId, playerId);

      expect(result.is_bot).toBe(true);
      expect(result.winner_id).toBe(playerId);
    });
  });

  describe('getMatchById', () => {
    it('retrieves match by ID', async () => {
      const matchId = 'match-003';

      const mockMatch = {
        id: matchId,
        blue_player_id: 'player-blue',
        red_player_id: 'player-red',
        winner_id: null,
        status: 'in_progress',
        is_bot: false,
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockMatch],
      });

      const result = await matchRepository.getMatchById(matchId);

      expect(db.query).toHaveBeenCalledWith(
        matchQueries.getMatchById,
        [matchId]
      );
      expect(result).toEqual(mockMatch);
    });

    it('returns undefined when match not found', async () => {
      const matchId = 'non-existent-match';

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [],
      });

      const result = await matchRepository.getMatchById(matchId);

      expect(result).toBeUndefined();
    });
  });

  describe('getMatchesByPlayer', () => {
    it('returns all matches for a player', async () => {
      const playerId = 'player-004';

      const mockMatches = [
        {
          id: 'match-1',
          blue_player_id: playerId,
          red_player_id: 'opponent-1',
          status: 'finished',
        },
        {
          id: 'match-2',
          blue_player_id: 'opponent-2',
          red_player_id: playerId,
          status: 'finished',
        },
        {
          id: 'match-3',
          blue_player_id: playerId,
          red_player_id: 'bot',
          status: 'in_progress',
          is_bot: true,
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockMatches,
      });

      const result = await matchRepository.getMatchesByPlayer(playerId);

      expect(db.query).toHaveBeenCalledWith(
        matchQueries.getMatchesByPlayer,
        [playerId, playerId]
      );
      expect(result).toEqual(mockMatches);
      expect(result.length).toBe(3);
    });

    it('returns empty array when player has no matches', async () => {
      const playerId = 'new-player-no-matches';

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [],
      });

      const result = await matchRepository.getMatchesByPlayer(playerId);

      expect(result).toEqual([]);
    });

    it('includes both blue and red player matches', async () => {
      const playerId = 'player-blue-and-red';

      const mockMatches = [
        {
          id: 'match-as-blue',
          blue_player_id: playerId,
          red_player_id: 'opponent',
          status: 'finished',
        },
        {
          id: 'match-as-red',
          blue_player_id: 'opponent',
          red_player_id: playerId,
          status: 'finished',
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockMatches,
      });

      const result = await matchRepository.getMatchesByPlayer(playerId);

      // Should include matches where player is either blue or red
      expect(result.some((m) => m.blue_player_id === playerId)).toBe(true);
      expect(result.some((m) => m.red_player_id === playerId)).toBe(true);
    });
  });

  describe('createMatch', () => {
    it('creates new match with two players', async () => {
      const bluePlayerId = 'player-blue-new';
      const redPlayerId = 'player-red-new';

      const mockNewMatch = {
        id: 'new-match-001',
        blue_player_id: bluePlayerId,
        red_player_id: redPlayerId,
        is_bot: false,
        status: 'in_progress',
        created_at: '2024-01-15T09:00:00Z',
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockNewMatch],
      });

      const result = await matchRepository.createMatch(
        bluePlayerId,
        redPlayerId,
        false,
        0
      );

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockNewMatch);
      expect(result.status).toBe('in_progress');
    });

    it('creates bot match with difficulty level', async () => {
      const playerId = 'player-bot-match';
      const difficulty = 2;

      const mockBotMatch = {
        id: 'bot-match-002',
        blue_player_id: playerId,
        red_player_id: null, // Bot doesn't have real player ID
        is_bot: true,
        bot_difficulty: difficulty,
        status: 'in_progress',
      };

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: [mockBotMatch],
      });

      const result = await matchRepository.createMatch(
        playerId,
        null,
        true,
        difficulty
      );

      expect(result.is_bot).toBe(true);
      expect(result.bot_difficulty).toBe(difficulty);
    });
  });

  describe('integration scenarios', () => {
    it('handles complete match lifecycle: create → get → finish', async () => {
      const matchId = 'lifecycle-match';
      const bluePlayerId = 'player-blue-lifecycle';
      const redPlayerId = 'player-red-lifecycle';

      // Step 1: Create match
      const createdMatch = {
        id: matchId,
        blue_player_id: bluePlayerId,
        red_player_id: redPlayerId,
        status: 'in_progress',
        winner_id: null,
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [createdMatch] }) // Create
        .mockResolvedValueOnce({ rows: [createdMatch] }) // Get
        .mockResolvedValueOnce({
          // Finish
          rows: [
            {
              id: matchId,
              blue_player_id: bluePlayerId,
              red_player_id: redPlayerId,
              status: 'finished',
              winner_id: bluePlayerId,
              ended_at: '2024-01-15T10:30:00Z',
            },
          ],
        });

      // Create
      const created = await matchRepository.createMatch(
        bluePlayerId,
        redPlayerId,
        false,
        0
      );
      expect(created.status).toBe('in_progress');

      // Get during play
      const inProgress = await matchRepository.getMatchById(matchId);
      expect(inProgress.winner_id).toBeNull();

      // Finish
      const finished = await matchRepository.finishMatch(matchId, bluePlayerId);
      expect(finished.status).toBe('finished');
      expect(finished.winner_id).toBe(bluePlayerId);
    });

    it('tracks multiple matches for player', async () => {
      const playerId = 'multi-match-player';

      const mockMatches = [
        {
          id: 'match-1',
          blue_player_id: playerId,
          red_player_id: 'opponent-1',
          winner_id: playerId,
          status: 'finished',
        },
        {
          id: 'match-2',
          blue_player_id: 'opponent-2',
          red_player_id: playerId,
          winner_id: 'opponent-2',
          status: 'finished',
        },
        {
          id: 'match-3',
          blue_player_id: playerId,
          red_player_id: 'opponent-3',
          winner_id: playerId,
          status: 'finished',
        },
        {
          id: 'match-4',
          blue_player_id: playerId,
          red_player_id: null,
          winner_id: playerId,
          status: 'finished',
          is_bot: true,
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockMatches,
      });

      const result = await matchRepository.getMatchesByPlayer(playerId);

      // Count wins
      const wins = result.filter((m) => m.winner_id === playerId).length;
      expect(wins).toBe(3); // Won matches 1, 3, and 4

      // Count total matches
      expect(result.length).toBe(4);
    });

    it('handles concurrent match operations', async () => {
      const matchId1 = 'concurrent-match-1';
      const matchId2 = 'concurrent-match-2';
      const winnerId1 = 'player-1';
      const winnerId2 = 'player-2';

      const mockMatch1Finished = {
        id: matchId1,
        winner_id: winnerId1,
        status: 'finished',
      };

      const mockMatch2Finished = {
        id: matchId2,
        winner_id: winnerId2,
        status: 'finished',
      };

      vi.spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockMatch1Finished] })
        .mockResolvedValueOnce({ rows: [mockMatch2Finished] });

      // Simulate parallel match finish operations
      const results = await Promise.all([
        matchRepository.finishMatch(matchId1, winnerId1),
        matchRepository.finishMatch(matchId2, winnerId2),
      ]);

      expect(results[0].winner_id).toBe(winnerId1);
      expect(results[1].winner_id).toBe(winnerId2);
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('distinguishes between regular and bot matches', async () => {
      const playerId = 'multi-match-types';

      const mockMatches = [
        {
          id: 'pvp-match',
          blue_player_id: playerId,
          red_player_id: 'opponent',
          is_bot: false,
          bot_difficulty: 0,
          status: 'finished',
        },
        {
          id: 'pve-match',
          blue_player_id: playerId,
          red_player_id: null,
          is_bot: true,
          bot_difficulty: 2,
          status: 'finished',
        },
      ];

      vi.spyOn(db, 'query').mockResolvedValue({
        rows: mockMatches,
      });

      const result = await matchRepository.getMatchesByPlayer(playerId);

      const pvpMatches = result.filter((m) => !m.is_bot);
      const botMatches = result.filter((m) => m.is_bot);

      expect(pvpMatches.length).toBe(1);
      expect(botMatches.length).toBe(1);
      expect(botMatches[0].bot_difficulty).toBe(2);
    });
  });
});
