import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rankingService = require('../../src/modules/ranking/domain/rankingService.js');
const rankingController = require('../../src/modules/ranking/entry-points/rankingController.js');

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
});
