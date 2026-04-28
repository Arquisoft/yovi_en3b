import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMatch, finishMatch, evaluateBoard, getBotMove } from '../components/GameScreen/game.api';

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

    await expect(finishMatch('match-3', 'user-1')).rejects.toThrow('Server error: 500');
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

    // 400 Bad Request
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid YEN format' }),
    } as Response);

    await expect(evaluateBoard(boardPayload)).rejects.toThrow('Invalid YEN format');
  });

  it('falls back to the status text when board evaluation fails without JSON', async () => {
    const boardPayload = { layout: '...' };

    // 502 Bad Gateway
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(evaluateBoard(boardPayload)).rejects.toThrow('502 Bad Gateway');
  });

  // --- TESTS PARA getBotMove ---

  it('gets bot move successfully and returns coordinates', async () => {
    const position = JSON.stringify({
      size: 4,
      turn: 1,
      players: ['B', 'R'],
      layout: './../.B./....'
    });
    const botId = 'easy_bot';
    const expectedCoords = { x: 1, y: 2, z: 0 };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ coords: expectedCoords }),
    } as Response);

    await expect(getBotMove(position, botId)).resolves.toEqual(expectedCoords);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/play?'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('encodes position parameter correctly in URL', async () => {
    const position = JSON.stringify({ size: 4, turn: 1, players: ['B', 'R'], layout: '...' });
    const botId = 'medium_bot';
    const expectedCoords = { x: 0, y: 1, z: 2 };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ coords: expectedCoords }),
    } as Response);

    await getBotMove(position, botId);

    const callUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(callUrl).toContain(`/play?position=${encodeURIComponent(position)}&bot_id=${botId}`);
  });

  it('surfaces backend errors during bot move retrieval', async () => {
    const position = JSON.stringify({ size: 4 });
    const botId = 'hard_bot';

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Bot unavailable' }),
    } as Response);

    await expect(getBotMove(position, botId)).rejects.toThrow('Bot unavailable');
  });

  it('falls back to status text when bot move request fails without JSON', async () => {
    const position = JSON.stringify({ size: 4 });
    const botId = 'easy_bot';

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.reject(new Error('invalid json')),
    } as unknown as Response);

    await expect(getBotMove(position, botId)).rejects.toThrow('503 Service Unavailable');
  });

  it('returns correct coordinates for different bot difficulties', async () => {
    const position = JSON.stringify({ size: 3 });
    const difficulties = ['easy_bot', 'medium_bot', 'hard_bot'];

    for (const botId of difficulties) {
      const expectedCoords = { x: 2, y: 1, z: 0 };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ coords: expectedCoords }),
      } as Response);

      const result = await getBotMove(position, botId);
      expect(result).toEqual(expectedCoords);
    }
  });
  
});
