import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rankingService = require('../src/modules/ranking/domain/rankingService.js');
const rankingController = require('../src/modules/ranking/entry-points/rankingController.js');

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('rankingController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('add returns 201 when userId is provided', async () => {
    const req = { body: { userId: 'u1', totalMatches: 1, winMatches: 1, score: 50 } };
    const res = makeRes();
    vi.spyOn(rankingService, 'addStats').mockResolvedValue({ user_id: 'u1' });

    await rankingController.add(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Ranking added/updated',
      ranking: { user_id: 'u1' },
    });
  });

  it('add returns 400 when userId is missing', async () => {
    const req = { body: { totalMatches: 1 } };
    const res = makeRes();

    await rankingController.add(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'userId is required' });
  });

  it('update returns 200 on success', async () => {
    const req = { params: { userId: 'u2' }, body: { totalMatches: 2, winMatches: 1 } };
    const res = makeRes();
    vi.spyOn(rankingService, 'setStats').mockResolvedValue({ user_id: 'u2' });

    await rankingController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Ranking updated',
      ranking: { user_id: 'u2' },
    });
  });

  it('get returns 404 when ranking is missing', async () => {
    const req = { params: { userId: 'missing' } };
    const res = makeRes();
    vi.spyOn(rankingService, 'getRanking').mockResolvedValue(undefined);

    await rankingController.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ranking not found' });
  });

  it('get returns ranking when found', async () => {
    const req = { params: { userId: 'u3' } };
    const res = makeRes();
    vi.spyOn(rankingService, 'getRanking').mockResolvedValue({ user_id: 'u3' });

    await rankingController.get(req, res);

    expect(res.json).toHaveBeenCalledWith({ ranking: { user_id: 'u3' } });
  });

  it('update returns 400 on error', async () => {
    const req = { params: { userId: 'u4' }, body: {} };
    const res = makeRes();
    vi.spyOn(rankingService, 'setStats').mockRejectedValue(new Error('update failed'));

    await rankingController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'update failed' });
  });

  describe('getMyRankingPosition', () => {
    it('returns 200 with position and total players', async () => {
      const req = { query: { userId: 'u5' } };
      const res = makeRes();
      vi.spyOn(rankingService, 'getUserRankingPosition').mockResolvedValue({
        position: 5,
        totalPlayers: 127,
      });

      await rankingController.getMyRankingPosition(req, res);

      expect(rankingService.getUserRankingPosition).toHaveBeenCalledWith('u5');
      expect(res.json).toHaveBeenCalledWith({ position: 5, totalPlayers: 127 });
    });

    it('returns 400 when userId is missing', async () => {
      const req = { query: {} };
      const res = makeRes();

      await rankingController.getMyRankingPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'userId is required' });
    });

    it('returns 404 when user not found in rankings', async () => {
      const req = { query: { userId: 'u_unknown' } };
      const res = makeRes();
      vi.spyOn(rankingService, 'getUserRankingPosition').mockResolvedValue(null);

      await rankingController.getMyRankingPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found in rankings' });
    });

    it('returns 400 on service error', async () => {
      const req = { query: { userId: 'u6' } };
      const res = makeRes();
      vi.spyOn(rankingService, 'getUserRankingPosition').mockRejectedValue(
        new Error('Database error')
      );

      await rankingController.getMyRankingPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getGlobalRanking', () => {
    it('returns 200 with global ranking list', async () => {
      const req = {};
      const res = makeRes();
      const mockRankings = [
        { position: 1, user_id: 'u1', username: 'player1', score: 500, win_rate: 100 },
        { position: 2, user_id: 'u2', username: 'player2', score: 400, win_rate: 90 },
      ];
      vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockRankings);

      await rankingController.getGlobalRanking(req, res);

      expect(rankingService.getGlobalRanking).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ ranking: mockRankings });
    });

    it('returns empty ranking array when no players', async () => {
      const req = {};
      const res = makeRes();
      vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue([]);

      await rankingController.getGlobalRanking(req, res);

      expect(res.json).toHaveBeenCalledWith({ ranking: [] });
    });

    it('returns 400 on service error', async () => {
      const req = {};
      const res = makeRes();
      vi.spyOn(rankingService, 'getGlobalRanking').mockRejectedValue(
        new Error('Database error')
      );

      await rankingController.getGlobalRanking(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});

