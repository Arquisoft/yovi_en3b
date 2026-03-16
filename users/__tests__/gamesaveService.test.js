import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gamesaveRepo = require('../src/modules/gamesave/data-access/gamesaveRepository.js');
const gamesaveService = require('../src/modules/gamesave/domain/gamesaveService.js');

describe('gamesaveService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saveMove validates and creates a game save', async () => {
    const payload = {
      matchId: 'm1',
      moveNumber: 1,
      playerLastMove: 'C3',
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
        playerLastMove: 'A1',
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
        playerLastMove: 'A1',
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Move number must be a positive integer');
  });

  it('saveMove rejects missing moveNumber', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        playerLastMove: 'A1',
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Move number is required');
  });

  it('saveMove rejects invalid playerLastMove', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 123, // String olmalı
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Player last move must be a string.');
  });

  it('saveMove rejects invalid botLastMove', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        botLastMove: 123, // String olmalı
        resultingBoardState: '{}',
      })
    ).rejects.toThrow('Bot last move must be a string.');
  });

  it('saveMove rejects missing board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 'A1',
      })
    ).rejects.toThrow('Board state must be a non-empty JSON string');
  });

  it('saveMove rejects non-string board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 'A1',
        resultingBoardState: { size: 3 }, // Object değil string(stringify edilmiş) olmalı
      })
    ).rejects.toThrow('Board state must be a non-empty JSON string');
  });

  it('saveMove rejects invalid JSON board state', async () => {
    await expect(
      gamesaveService.saveMove({
        matchId: 'm1',
        moveNumber: 1,
        playerLastMove: 'A1',
        resultingBoardState: 'not-json',
      })
    ).rejects.toThrow('Board state must be valid JSON');
  });

  it('loadMatchMoves requires matchId', async () => {
    await expect(gamesaveService.loadMatchMoves('')).rejects.toThrow('Match ID is required');
  });

  it('loadMatchMoves returns moves', async () => {
    const rows = [{ id: '1' }];
    vi.spyOn(gamesaveRepo, 'getGameSavesByMatchId').mockResolvedValue(rows);
    const result = await gamesaveService.loadMatchMoves('m1');
    expect(result).toEqual(rows);
  });

  it('loadMove requires matchId', async () => {
    await expect(gamesaveService.loadMove('', 1)).rejects.toThrow('Match ID is required');
  });

  it('loadMove requires moveNumber', async () => {
    await expect(gamesaveService.loadMove('m1')).rejects.toThrow('Move number is required');
  });

  it('loadMove requires valid moveNumber', async () => {
    await expect(gamesaveService.loadMove('m1', 0)).rejects.toThrow('Move number must be a positive integer');
  });

  it('loadMove returns move when found', async () => {
    const move = { id: 'm1' };
    vi.spyOn(gamesaveRepo, 'getGameSaveByMatchIdAndMoveNumber').mockResolvedValue(move);
    const result = await gamesaveService.loadMove('m1', 1);
    expect(result).toEqual(move);
  });

  it('loadMove throws when move not found', async () => {
    vi.spyOn(gamesaveRepo, 'getGameSaveByMatchIdAndMoveNumber').mockResolvedValue(undefined);
    await expect(gamesaveService.loadMove('m1', 1)).rejects.toThrow('Move not found');
  });

  it('loadLatestMove requires matchId', async () => {
    await expect(gamesaveService.loadLatestMove('')).rejects.toThrow('Match ID is required');
  });

  it('loadLatestMove returns latest move', async () => {
    const move = { id: 'latest' };
    vi.spyOn(gamesaveRepo, 'getLatestGameSaveByMatchId').mockResolvedValue(move);
    const result = await gamesaveService.loadLatestMove('m1');
    expect(result).toEqual(move);
  });

  it('loadLatestMove throws when no moves exist', async () => {
    vi.spyOn(gamesaveRepo, 'getLatestGameSaveByMatchId').mockResolvedValue(undefined);
    await expect(gamesaveService.loadLatestMove('m1')).rejects.toThrow('No moves found for this match');
  });
});