import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const matchService = require('../src/modules/match/domain/matchService.js');
const matchRepository = require('../src/modules/match/data-access/matchRepository.js');
const rankingService = require('../src/modules/ranking/domain/rankingService.js');

describe('matchService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('finishMatch', () => {
    it('finishes a match and updates winner ranking', async () => {
      const matchId = 'match-001';
      const winnerId = 'player-blue';
      const loserId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: loserId,
        winner_id: winnerId,
        status: 'finished',
        ended_at: '2024-01-15T10:30:00Z',
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockResolvedValue({
        user_id: winnerId,
        total_matches: 1,
        win_matches: 1,
        score: 50,
      });

      const result = await matchService.finishMatch(matchId, winnerId);

      expect(matchRepository.finishMatch).toHaveBeenCalledWith(matchId, winnerId);
      expect(result).toEqual(mockMatch);
    });

    it('updates both winner and loser rankings on match finish', async () => {
      const matchId = 'match-002';
      const winnerId = 'player-blue';
      const loserId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: loserId,
        winner_id: winnerId,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking')
        .mockResolvedValueOnce({
          user_id: winnerId,
          total_matches: 1,
          win_matches: 1,
          score: 50,
        })
        .mockResolvedValueOnce({
          user_id: loserId,
          total_matches: 1,
          win_matches: 0,
          score: -50,
        });

      await matchService.finishMatch(matchId, winnerId);

      // Verify winner gets +1 match, +1 win
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledWith(
        winnerId,
        1,
        1
      );

      // Verify loser gets +1 match, 0 wins
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledWith(
        loserId,
        1,
        0
      );

      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledTimes(2);
    });

    it('correctly identifies winner as blue player', async () => {
      const matchId = 'match-003';
      const blueWinnerId = 'player-blue';
      const redLoserId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: blueWinnerId,
        red_player_id: redLoserId,
        winner_id: blueWinnerId,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockResolvedValue({});

      await matchService.finishMatch(matchId, blueWinnerId);

      // First call should be for the winner (blue)
      const firstCall = rankingService.updateOrInitializeRanking.mock
        .calls[0];
      expect(firstCall[0]).toBe(blueWinnerId);
      expect(firstCall[1]).toBe(1); // totalMatches
      expect(firstCall[2]).toBe(1); // winMatches

      // Second call should be for the loser (red)
      const secondCall = rankingService.updateOrInitializeRanking.mock
        .calls[1];
      expect(secondCall[0]).toBe(redLoserId);
      expect(secondCall[1]).toBe(1); // totalMatches
      expect(secondCall[2]).toBe(0); // winMatches
    });

    it('correctly identifies winner as red player', async () => {
      const matchId = 'match-004';
      const bluePlayerId = 'player-blue';
      const redWinnerId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: bluePlayerId,
        red_player_id: redWinnerId,
        winner_id: redWinnerId,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockResolvedValue({});

      await matchService.finishMatch(matchId, redWinnerId);

      // First call should be for the winner (red)
      const firstCall = rankingService.updateOrInitializeRanking.mock
        .calls[0];
      expect(firstCall[0]).toBe(redWinnerId);
      expect(firstCall[2]).toBe(1); // winMatches

      // Second call should be for the loser (blue)
      const secondCall = rankingService.updateOrInitializeRanking.mock
        .calls[1];
      expect(secondCall[0]).toBe(bluePlayerId);
      expect(secondCall[2]).toBe(0); // winMatches
    });

    it('handles match with no red player (bot match)', async () => {
      const matchId = 'match-bot-001';
      const winnerId = 'human-player';
      const botId = null;

      const mockMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: botId,
        winner_id: winnerId,
        is_bot: true,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockResolvedValue({});

      const result = await matchService.finishMatch(matchId, winnerId);

      // Should only update winner ranking, not bot ranking
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledWith(
        winnerId,
        1,
        1
      );

      // Should only be called once for the winner
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMatch);
    });

    it('propagates repository errors', async () => {
      const matchId = 'match-error';
      const winnerId = 'player';

      vi.spyOn(matchRepository, 'finishMatch').mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        matchService.finishMatch(matchId, winnerId)
      ).rejects.toThrow('Database error');
    });

    it('propagates ranking service errors', async () => {
      const matchId = 'match-005';
      const winnerId = 'player-blue';
      const loserId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: loserId,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockRejectedValue(
        new Error('Ranking update failed')
      );

      await expect(
        matchService.finishMatch(matchId, winnerId)
      ).rejects.toThrow('Ranking update failed');
    });

    it('returns the updated match object', async () => {
      const matchId = 'match-006';
      const winnerId = 'player-blue';
      const loserId = 'player-red';

      const expectedMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: loserId,
        winner_id: winnerId,
        status: 'finished',
        ended_at: '2024-01-15T11:00:00Z',
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(
        expectedMatch
      );
      vi.spyOn(rankingService, 'updateOrInitializeRanking').mockResolvedValue({});

      const result = await matchService.finishMatch(matchId, winnerId);

      expect(result).toEqual(expectedMatch);
      expect(result.status).toBe('finished');
      expect(result.winner_id).toBe(winnerId);
    });

    it('accumulates stats correctly for players with multiple matches', async () => {
      const matchId = 'match-007';
      const winnerId = 'player-blue';
      const loserId = 'player-red';

      const mockMatch = {
        id: matchId,
        blue_player_id: winnerId,
        red_player_id: loserId,
        winner_id: winnerId,
      };

      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(mockMatch);

      // Simulate player with existing matches
      vi.spyOn(rankingService, 'updateOrInitializeRanking')
        .mockResolvedValueOnce({
          user_id: winnerId,
          total_matches: 6, // Was 5, now 6
          win_matches: 5, // Was 4, now 5
          score: 350,
        })
        .mockResolvedValueOnce({
          user_id: loserId,
          total_matches: 6, // Was 5, now 6
          win_matches: 2, // Was 2, still 2
          score: -50,
        });

      await matchService.finishMatch(matchId, winnerId);

      // Both players should have their stats incremented
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledWith(
        winnerId,
        1,
        1
      );
      expect(rankingService.updateOrInitializeRanking).toHaveBeenCalledWith(
        loserId,
        1,
        0
      );
    });

    it('lanza un error si no encuentra la partida', async () => {
      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue(null);

      await expect(
        matchService.finishMatch('partida-falsa', 'jugador-1')
      ).rejects.toThrow('Match not found');
    });

    it('lanza un error si el ganador no pertenece a la partida', async () => {
      vi.spyOn(matchRepository, 'finishMatch').mockResolvedValue({
        id: 'match-123',
        blue_player_id: 'jugador-1',
        red_player_id: 'jugador-2'
      });

      await expect(
        matchService.finishMatch('match-123', 'hacker-infiltrado')
      ).rejects.toThrow('Winner ID is not a player in this match');
    });
  });

  describe('createMatch', () => {
    it('crea la partida con los argumentos individuales correctos', async () => {
      const mockMatch = { id: 'new-match-123' };
      vi.spyOn(matchRepository, 'createMatch').mockResolvedValue(mockMatch);

      const result = await matchService.createMatch('player-blue', 'player-red', false, null);
      
      expect(matchRepository.createMatch).toHaveBeenCalledWith({
        bluePlayerId: 'player-blue',
        redPlayerId: 'player-red',
        isBot: false,
        botDifficulty: 0
      });
      expect(result).toEqual(mockMatch);
    });

    it('lanza error si falta el ID del jugador azul', async () => {
      await expect(matchService.createMatch(null, 'red', false, null))
        .rejects.toThrow('You need a Blue Player ID.');
    });

    it('lanza error si es contra un bot pero no tiene dificultad', async () => {
      await expect(matchService.createMatch('blue', null, true, null))
        .rejects.toThrow('If you play against a BOT, you must select a difficulty.');
    });

    it('lanza error si es PvP pero falta el ID del jugador rojo', async () => {
      await expect(matchService.createMatch('blue', null, false, null))
        .rejects.toThrow("If you don't play against a BOT, you need a Red Player ID.");
    });
  });

  describe('getMatchesForPlayer', () => {
    it('lanza error si no se pasa playerId', async () => {
      await expect(matchService.getMatchesForPlayer(null))
        .rejects.toThrow("You must select a player ID");
    });

    it('devuelve array vacío si el repositorio no encuentra partidas', async () => {
      vi.spyOn(matchRepository, 'findMatchesByPlayerId').mockResolvedValue([]);
      const result = await matchService.getMatchesForPlayer('player-1');
      expect(result).toEqual([]);
    });

    it('devuelve las partidas encontradas', async () => {
      const mockMatches = [{ id: 'm1' }, { id: 'm2' }];
      vi.spyOn(matchRepository, 'findMatchesByPlayerId').mockResolvedValue(mockMatches);
      
      const result = await matchService.getMatchesForPlayer('player-1');
      expect(result).toEqual(mockMatches);
    });
  });

  describe('getMatchHistoryForPlayer', () => {
    it('lanza error si no se pasa playerId', async () => {
      await expect(matchService.getMatchHistoryForPlayer(null))
        .rejects.toThrow("You must select a player ID");
    });

    it('mapea correctamente el historial para una victoria contra humano', async () => {
      const mockRepoData = [{
        id: 'm1', created_at: '2024-01-01', status: 'finished',
        winner_id: 'player-1', is_bot: false, opponent_name: 'Rival',
        board_size: 5, opponent_avatar_id: 'avatar-1'
      }];
      vi.spyOn(matchRepository, 'findMatchHistoryByPlayerId').mockResolvedValue(mockRepoData);

      const result = await matchService.getMatchHistoryForPlayer('player-1');
      
      expect(result[0]).toEqual({
        id: 'm1', date: '2024-01-01', result: 'win', size: 5,
        opponent: 'Rival', isBot: false, opponentAvatarId: 'avatar-1', status: 'finished'
      });
    });

    it('mapea correctamente el historial para una derrota contra bot (Medio)', async () => {
      const mockRepoData = [{
        id: 'm2', status: 'finished', winner_id: 'bot',
        is_bot: true, bot_difficulty: 1
      }];
      vi.spyOn(matchRepository, 'findMatchHistoryByPlayerId').mockResolvedValue(mockRepoData);

      const result = await matchService.getMatchHistoryForPlayer('player-1');
      
      expect(result[0].result).toBe('lose');
      expect(result[0].opponent).toBe('Bot Medium');
    });

    it('mapea correctamente el historial para una partida sin terminar', async () => {
      const mockRepoData = [{ id: 'm3', status: 'in_progress', is_bot: false }];
      vi.spyOn(matchRepository, 'findMatchHistoryByPlayerId').mockResolvedValue(mockRepoData);

      const result = await matchService.getMatchHistoryForPlayer('player-1');
      
      expect(result[0].result).toBe('in_progress');
    });
  });
});
