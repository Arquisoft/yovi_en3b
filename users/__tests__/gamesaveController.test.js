import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gamesaveService = require('../src/modules/gamesave/domain/gamesaveService.js');
const gamesaveController = require('../src/modules/gamesave/entry-points/gamesaveController.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('gamesaveController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saveMove returns 201 with gameSave', async () => {
    const res = makeRes();
    const req = { body: { matchId: 'm1' } };
    const gameSave = { id: 'g1' };
    vi.spyOn(gamesaveService, 'saveMove').mockResolvedValue(gameSave);

    await gamesaveController.saveMove(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Game save created successfully',
      gameSave,
    });
  });

  it('saveMove returns 400 on error', async () => {
    const res = makeRes();
    const req = { body: {} };
    vi.spyOn(gamesaveService, 'saveMove').mockRejectedValue(new Error('boom'));

    await gamesaveController.saveMove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
  });

  it('getMatchMoves returns moves', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1' } };
    const moves = [{ id: '1' }];
    vi.spyOn(gamesaveService, 'loadMatchMoves').mockResolvedValue(moves);

    await gamesaveController.getMatchMoves(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Moves retrieved successfully',
      moves,
    });
  });

  it('getMatchMoves returns 400 on error', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1' } };
    vi.spyOn(gamesaveService, 'loadMatchMoves').mockRejectedValue(new Error('bad match'));

    await gamesaveController.getMatchMoves(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bad match' });
  });

  it('getMove returns move when found', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1', moveNumber: '2' } };
    const move = { id: 'mv2' };
    vi.spyOn(gamesaveService, 'loadMove').mockResolvedValue(move);

    await gamesaveController.getMove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Move retrieved successfully',
      move,
    });
  });

  it('getMove returns 400 on error', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1', moveNumber: '2' } };
    vi.spyOn(gamesaveService, 'loadMove').mockRejectedValue(new Error('Missing'));

    await gamesaveController.getMove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing' });
  });

  it('getLatestMove returns latest move', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1' } };
    const move = { id: 'last' };
    vi.spyOn(gamesaveService, 'loadLatestMove').mockResolvedValue(move);

    await gamesaveController.getLatestMove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Latest move retrieved successfully',
      move,
    });
  });

  it('getLatestMove returns 400 on error', async () => {
    const res = makeRes();
    const req = { params: { matchId: 'm1' } };
    vi.spyOn(gamesaveService, 'loadLatestMove').mockRejectedValue(new Error('no moves'));

    await gamesaveController.getLatestMove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'no moves' });
  });
});
