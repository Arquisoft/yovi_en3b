import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMatch, finishMatch, evaluateBoard } from '../components/GameScreen/game.api';

describe('game API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  it('throws when no userId is available for match creation', async () => {
    await expect(createMatch(false)).rejects.toThrow('User ID not found. Please log in again.');
  });

  it('throws when bot match difficulty is missing', async () => {
    localStorage.setItem('userId', 'user-1');

    await expect(createMatch(true)).rejects.toThrow('Bot difficulty is required for bot matches');
  });

  it('creates a match with the expected payload', async () => {
    localStorage.setItem('userId', 'user-7');

    const match = {
      id: 'match-1',
      blue_player_id: 'user-7',
      is_bot: true,
      bot_difficulty: 2,
      status: 'in_progress',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ match }),
    } as Response);

    await expect(createMatch(true, 2)).resolves.toEqual(match);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/matches/create',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          bluePlayerId: 'user-7',
          isBot: true,
          botDifficulty: 2,
        }),
      })
    );
  });

  it('surfaces backend errors during match creation', async () => {
    localStorage.setItem('userId', 'user-9');

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Creation failed' }),
    } as Response);

    await expect(createMatch(false)).rejects.toThrow('Creation failed');
  });

  it('finishes a match and returns backend data', async () => {
    const match = {
      id: 'match-2',
      blue_player_id: 'user-1',
      red_player_id: 'user-2',
      is_bot: false,
      status: 'finished',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ match }),
    } as Response);

    await expect(finishMatch('match-2', 'user-1')).resolves.toEqual(match);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/matches/finish',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          matchId: 'match-2',
          winnerId: 'user-1',
        }),
      })
    );
  });

  it('falls back to the status text when finishing a match fails without JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(finishMatch('match-3', 'user-1')).rejects.toThrow('500 Server Error');
  });


  // --- TESTS PARA evaluateBoard ---

  it('evaluates board tension successfully and returns scores', async () => {
    // 1. Preparamos el payload simulado
    const boardPayload = {
      size: 4,
      turn: 1,
      players: ['B', 'R'],
      layout: './../.B./....'
    };
    const expectedScores = { blue_score: 24, red_score: 22 };

    // 2. Simulamos la respuesta exitosa del servidor
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(expectedScores),
    } as Response);

    // 3. Comprobamos que devuelve los datos correctos
    await expect(evaluateBoard(boardPayload)).resolves.toEqual(expectedScores);
    
    // 4. Comprobamos que hizo la petición exacta a la ruta y con el body correctos
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/matches/evaluate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardPayload),
      })
    );
  });

  it('surfaces backend errors during board evaluation', async () => {
    const boardPayload = { layout: 'invalid_yen' };

    // Simulamos que el backend de Node devuelve un 400 Bad Request
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid YEN format' }),
    } as Response);

    await expect(evaluateBoard(boardPayload)).rejects.toThrow('Invalid YEN format');
  });

  it('falls back to the status text when board evaluation fails without JSON', async () => {
    const boardPayload = { layout: '...' };

    // Simulamos un error grave del servidor (ej. 502 Bad Gateway) donde el JSON no se puede parsear
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(evaluateBoard(boardPayload)).rejects.toThrow('502 Bad Gateway');
  });
  
});
