import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gamesaveRepo = require('../../src/modules/gamesave/data-access/gamesaveRepository.js');
const gamesaveService = require('../../src/modules/gamesave/domain/gamesaveService.js');

describe('gamesaveService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saveMove validates and creates a game save', async () => {
    const payload = {
      matchId: 'm1',
      moveNumber: 1,
      playerLastMove: '1,2,0',
      botLastMove: null,
      resultingBoardState: JSON.stringify({ size: 3 }),
    };

    const fakeRow = { id: 'g1' };
    const spy = vi.spyOn(gamesaveRepo, 'createGameSave').mockResolvedValue(fakeRow);

    const result = await gamesaveService.saveMove(payload);

    expect(spy).toHaveBeenCalledWith(payload);
    expect(result).toEqual(fakeRow);
  });

  it('saveMove rejects missing matchId', async () => {
    const spy = vi.spyOn(gamesaveRepo, 'createGameSave');
    await expect(
      gamesaveService.saveMove({
        moveNumber: 1,
        playerLastMove: '1,2,0',
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Match ID is required');
    expect(spy).not.toHaveBeenCalled();
  });

  it('saveMove rejects invalid moveNumber', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 0,
        playerLastMove: '1,2,0',
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Move number must be a positive integer');
  });

  it('saveMove rejects missing moveNumber', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        playerLastMove: '1,2,0',
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Move number is required');
  });

  it('saveMove rejects invalid playerLastMove', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 123,
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Player last move must be a string.');
  });

  it('saveMove rejects non-Barycentric format', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 'A1', // Geçersiz format
        resultingBoardState: '{}',
      })
    ).rejects.toThrow("Invalid coordinate format. Must be Barycentric (e.g., '1,2,0').");
  });

  it('saveMove rejects missing board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: '1,2,0', // Koordinatı doğru verelim ki board state hatasına ulaşsın
      })
    ).rejects.toThrow('Board state must be a non-empty JSON string');
  });

  it('saveMove rejects non-string board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: '1,2,0',
        resultingBoardState: { size: 3 },
      })
    ).rejects.toThrow('Board state must be a non-empty JSON string');
  });

  it('saveMove rejects invalid JSON board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: '1,2,0',
        resultingBoardState: 'not-json',
      })
    ).rejects.toThrow('Board state must be valid JSON');
  });

  it('loadMatchMoves returns moves', async () => {
    const rows = [{ id: '1' }];
    vi.spyOn(gamesaveRepo, 'getGameSavesByMatchId').mockResolvedValue(rows);
    const result = await gamesaveService.loadMatchMoves('m1');
    expect(result).toEqual(rows);
  });

  it('loadMove returns move when found', async () => {
    const move = { id: 'm1' };
    vi.spyOn(gamesaveRepo, 'getGameSaveByMatchIdAndMoveNumber').mockResolvedValue(move);
    const result = await gamesaveService.loadMove('m1', 1);
    expect(result).toEqual(move);
  });

  it('loadLatestMove returns latest move', async () => {
    const move = { id: 'latest' };
    vi.spyOn(gamesaveRepo, 'getLatestGameSaveByMatchId').mockResolvedValue(move);
    const result = await gamesaveService.loadLatestMove('m1');
    expect(result).toEqual(move);
  });
});