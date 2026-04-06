import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gamesaveRepo = require('../../src/modules/gamesave/data-access/gamesaveRepository.js');
const db = require('../../src/db/db.js');

describe('gamesaveRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('createGameSave inserts and returns first row', async () => {
    const fakeRow = { id: '1', move_number: 1 };
    const data = {
      matchId: 'm1',
      moveNumber: 1,
      playerLastMove: '1,2,0', // Yeni YEN/Barycentric formatımız
      botLastMove: null,       // Yeni kolonumuz
      resultingBoardState: '{"size":4,"turn":"R","players":["B","R"],"layout":"B/.B/RB./B..R"}',
    };

    const spy = vi.spyOn(db, 'query').mockResolvedValue({ rows: [fakeRow] });

    const result = await gamesaveRepo.createGameSave(data);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_saves'),
      // Burada dizinin sırası repository dosyasındaki values dizisiyle birebir aynı olmalı
      [data.matchId, data.moveNumber, data.playerLastMove, data.botLastMove, data.resultingBoardState]
    );
    expect(result).toEqual(fakeRow);
  });

  it('getGameSavesByMatchId returns rows', async () => {
    const rows = [{ id: '1' }, { id: '2' }];
    const spy = vi.spyOn(db, 'query').mockResolvedValue({ rows });

    const result = await gamesaveRepo.getGameSavesByMatchId('match-1');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('FROM game_saves'), ['match-1']);
    expect(result).toEqual(rows);
  });

  it('getGameSaveByMatchIdAndMoveNumber returns first row', async () => {
    const row = { id: '1', move_number: 2 };
    const spy = vi.spyOn(db, 'query').mockResolvedValue({ rows: [row] });

    const result = await gamesaveRepo.getGameSaveByMatchIdAndMoveNumber('match-2', 2);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('WHERE match_id = $1 AND move_number = $2'),
      ['match-2', 2]
    );
    expect(result).toEqual(row);
  });

  it('getLatestGameSaveByMatchId returns latest row', async () => {
    const row = { id: '1', move_number: 5 };
    const spy = vi.spyOn(db, 'query').mockResolvedValue({ rows: [row] });

    const result = await gamesaveRepo.getLatestGameSaveByMatchId('match-3');

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY move_number DESC'),
      ['match-3']
    );
    expect(result).toEqual(row);
  });
});