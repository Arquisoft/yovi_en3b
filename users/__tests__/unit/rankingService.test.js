import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rankingRepo = require('../../src/modules/ranking/data-access/rankingRepository.js');
const rankingService = require('../../src/modules/ranking/domain/rankingService.js');

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
});
