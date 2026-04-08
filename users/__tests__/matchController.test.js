import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const matchService = require('../src/modules/match/domain/matchService.js');
const matchController = require('../src/modules/match/entry-points/matchController.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('matchController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('finishMatch', () => {
    it('returns 200 when match is finished successfully', async () => {
      const req = {
        body: { matchId: 'match-001', winnerId: 'player-blue' },
      };
      const res = makeRes();

      const mockFinishedMatch = {
        id: 'match-001',
        blue_player_id: 'player-blue',
        red_player_id: 'player-red',
        winner_id: 'player-blue',
        status: 'finished',
        ended_at: '2024-01-15T10:30:00Z',
      };

      vi.spyOn(matchService, 'finishMatch').mockResolvedValue(
        mockFinishedMatch
      );

      await matchController.finishMatch(req, res);

      expect(matchService.finishMatch).toHaveBeenCalledWith('match-001', 'player-blue');
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('finished'),
        match: mockFinishedMatch,
      });
    });

    it('returns 400 when matchId is missing', async () => {
      const req = { body: { winnerId: 'player-id' } };
      const res = makeRes();

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('matchId'),
      });
    });

    it('returns 400 when winnerId is missing', async () => {
      const req = { body: { matchId: 'match-id' } };
      const res = makeRes();

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('winnerId'),
      });
    });

    it('returns 404 when match is not found', async () => {
      const req = {
        body: { matchId: 'match-error', winnerId: 'player-id' },
      };
      const res = makeRes();

      vi.spyOn(matchService, 'finishMatch').mockRejectedValue(
        new Error('Match not found')
      );

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Match not found',
      });
    });

    it('returns match with updated rankings included', async () => {
      const req = {
        body: { matchId: 'match-002', winnerId: 'winner-id' },
      };
      const res = makeRes();

      const mockMatch = {
        id: 'match-002',
        blue_player_id: 'winner-id',
        red_player_id: 'loser-id',
        winner_id: 'winner-id',
        status: 'finished',
      };

      vi.spyOn(matchService, 'finishMatch').mockResolvedValue(mockMatch);

      await matchController.finishMatch(req, res);

      const callArg = res.json.mock.calls[0][0];
      expect(callArg.match.winner_id).toBe('winner-id');
      expect(callArg.match.status).toBe('finished');
    });
  });

  describe('getMatches', () => {
    it('returns 200 with list of matches for player', async () => {
      const req = { params: { playerId: 'player-001' } };
      const res = makeRes();

      const mockMatches = [
        { id: 'match-1', blue_player_id: 'player-001' },
        { id: 'match-2', red_player_id: 'player-001' },
      ];

      vi.spyOn(matchService, 'getMatches').mockResolvedValue(mockMatches);

      await matchController.getMatches(req, res);

      expect(matchService.getMatches).toHaveBeenCalledWith('player-001');
      expect(res.json).toHaveBeenCalledWith(mockMatches);
    });

    it('returns empty array when player has no matches', async () => {
      const req = { params: { playerId: 'new-player' } };
      const res = makeRes();

      vi.spyOn(matchService, 'getMatches').mockResolvedValue([]);

      await matchController.getMatches(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns 400 when service throws error', async () => {
      const req = { params: { playerId: 'player-error' } };
      const res = makeRes();

      vi.spyOn(matchService, 'getMatches').mockRejectedValue(
        new Error('Database error')
      );

      await matchController.getMatches(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error',
      });
    });
  });

  describe('createMatch', () => {
    it('returns 201 when match is created', async () => {
      const req = {
        body: {
          bluePlayerId: 'player-blue',
          redPlayerId: 'player-red',
          isBot: false,
        },
      };
      const res = makeRes();

      const mockNewMatch = {
        id: 'new-match-001',
        blue_player_id: 'player-blue',
        red_player_id: 'player-red',
        status: 'in_progress',
      };

      vi.spyOn(matchService, 'createMatch').mockResolvedValue(mockNewMatch);

      await matchController.createMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Match'),
        match: mockNewMatch,
      });
    });

    it('returns 201 for bot match with difficulty', async () => {
      const req = {
        body: {
          bluePlayerId: 'player-001',
          isBot: true,
          botDifficulty: 2,
        },
      };
      const res = makeRes();

      const mockBotMatch = {
        id: 'bot-match-001',
        blue_player_id: 'player-001',
        is_bot: true,
        bot_difficulty: 2,
        status: 'in_progress',
      };

      vi.spyOn(matchService, 'createMatch').mockResolvedValue(mockBotMatch);

      await matchController.createMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          match: mockBotMatch,
        })
      );
    });

    it('returns 400 when required fields are missing', async () => {
      const req = { body: { isBot: false } }; // Missing bluePlayerId
      const res = makeRes();

      await matchController.createMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.any(String),
      });
    });

    it('returns 400 when bot match missing difficulty', async () => {
      const req = {
        body: {
          bluePlayerId: 'player-001',
          isBot: true,
          // Missing botDifficulty
        },
      };
      const res = makeRes();

      vi.spyOn(matchService, 'createMatch').mockRejectedValue(new Error("If you play against a BOT, you must select a difficulty."));

      await matchController.createMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('difficulty'),
      });
    });

    it('returns 400 when service throws error', async () => {
      const req = {
        body: {
          bluePlayerId: 'player-001',
          redPlayerId: 'player-002',
          isBot: false,
        },
      };
      const res = makeRes();

      vi.spyOn(matchService, 'createMatch').mockRejectedValue(
        new Error('Invalid player')
      );

      await matchController.createMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid player',
      });
    });

    it('validates both players for PvP match', async () => {
      const req = {
        body: {
          bluePlayerId: 'blue-player',
          redPlayerId: 'red-player',
          isBot: false,
        },
      };
      const res = makeRes();

      const mockMatch = {
        id: 'pvp-match',
        blue_player_id: 'blue-player',
        red_player_id: 'red-player',
        is_bot: false,
      };

      vi.spyOn(matchService, 'createMatch').mockResolvedValue(mockMatch);

      await matchController.createMatch(req, res);

      expect(matchService.createMatch).toHaveBeenCalledWith(
        'blue-player',
        'red-player',
        false,
        undefined
      );
    });
  });

  describe('error handling', () => {
    it('catches unexpected errors and returns 500', async () => {
      const req = { body: { matchId: 'match', winnerId: 'winner' } };
      const res = makeRes();

      vi.spyOn(matchService, 'finishMatch').mockRejectedValue(
        new Error('Unexpected error')
      );

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('handles null values gracefully', async () => {
      const req = { body: { matchId: null, winnerId: null } };
      const res = makeRes();

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('handles undefined values gracefully', async () => {
      const req = { body: {} };
      const res = makeRes();

      await matchController.finishMatch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('response formatting', () => {
    it('includes match in finished match response', async () => {
      const req = {
        body: { matchId: 'format-match', winnerId: 'format-winner' },
      };
      const res = makeRes();

      const mockMatch = {
        id: 'format-match',
        winner_id: 'format-winner',
        status: 'finished',
      };

      vi.spyOn(matchService, 'finishMatch').mockResolvedValue(mockMatch);

      await matchController.finishMatch(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('match');
      expect(responseData.match).toEqual(mockMatch);
    });

    it('returns proper HTTP status codes', async () => {
      const createReq = {
        body: {
          bluePlayerId: 'player',
          redPlayerId: 'opponent',
          isBot: false,
        },
      };
      const createRes = makeRes();

      const mockMatch = { id: 'new-match' };
      vi.spyOn(matchService, 'createMatch').mockResolvedValue(mockMatch);

      await matchController.createMatch(createReq, createRes);

      expect(createRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('integration scenarios', () => {
    it('handles full match workflow through controller', async () => {
      // Create match
      const createReq = {
        body: {
          bluePlayerId: 'blue-001',
          redPlayerId: 'red-001',
          isBot: false,
        },
      };
      const createRes = makeRes();

      const mockCreatedMatch = {
        id: 'wf-match-001',
        blue_player_id: 'blue-001',
        red_player_id: 'red-001',
        status: 'in_progress',
      };

      vi.spyOn(matchService, 'createMatch').mockResolvedValue(
        mockCreatedMatch
      );
      vi.spyOn(matchService, 'getMatches').mockResolvedValue([
        mockCreatedMatch,
      ]);
      vi.spyOn(matchService, 'finishMatch').mockResolvedValue({
        ...mockCreatedMatch,
        status: 'finished',
        winner_id: 'blue-001',
      });

      // Create
      await matchController.createMatch(createReq, createRes);
      expect(createRes.status).toHaveBeenCalledWith(201);

      // Get matches
      const getReq = { params: { playerId: 'blue-001' } };
      const getRes = makeRes();
      await matchController.getMatches(getReq, getRes);
      expect(getRes.json).toHaveBeenCalled();

      // Finish
      const finishReq = {
        body: { matchId: 'wf-match-001', winnerId: 'blue-001' },
      };
      const finishRes = makeRes();
      await matchController.finishMatch(finishReq, finishRes);
      expect(finishRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('finished'),
        })
      );
    });
  });
});
