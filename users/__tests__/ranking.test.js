import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const rankingRepo = require('../src/modules/ranking/data-access/rankingRepository.js');
const db = require('../src/db/db.js');

describe('rankingRepository.upsertRanking', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inserts a new ranking when none exists', async () => {
    // score should be computed as 50 * (2*win - total) => 50*(2*1-1)=50
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [{ user_id: 'u1', total_matches: 1, win_matches: 1, score: 50 }] });

    const res = await rankingRepo.addToRanking('u1', { totalMatches: 1, winMatches: 1 });

    expect(res.user_id).toBe('u1');
    expect(res.total_matches).toBe(1);
    expect(res.win_matches).toBe(1);
    expect(res.score).toBe(50);
  });

  it('retrieves ranking by user id', async () => {
    vi.spyOn(db, 'query').mockResolvedValue({ rows: [{ user_id: 'u2', total_matches: 5, win_matches: 2, score: -50 }] });

    const res = await rankingRepo.getRankingByUser('u2');

    expect(res.user_id).toBe('u2');
    expect(res.total_matches).toBe(5);
  });
});
